from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import psycopg2
import torch
import os
import re
from googletrans import Translator
from PIL import Image
import pytesseract
import io
import logging

app = Flask(__name__)

# Configurações de conexão com o banco de dados
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:0010900JT%40xC@localhost:5432/mydb")

# Configuração do log
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar o modelo e o tokenizador
model_name = "EleutherAI/gpt-neo-1.3B"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Definir o pad_token_id, já que o GPT-Neo não tem um token de preenchimento
tokenizer.pad_token = tokenizer.eos_token

# Função para conectar ao banco de dados
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

# Função para traduzir texto para o português, se necessário
def translate_to_portuguese(text, target_language='pt'):
    translator = Translator()
    return translator.translate(text, dest=target_language).text

# Função para realizar OCR na imagem (interpretar texto da imagem)
def extract_text_from_image(image_data):
    try:
        # Abrir a imagem a partir dos dados binários
        image = Image.open(io.BytesIO(image_data))
        # Extrair texto usando o Tesseract
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Erro ao processar a imagem: {e}")
        return ""

@app.route('/generate', methods=['POST'])
def generate_text():
    # Pegue o prompt enviado pela requisição
    prompt = request.json.get('prompt')
    print(prompt)

    # Obter o email do cabeçalho Authorization
    email = request.args.get('email')
 # Esperando o email no cabeçalho X-User-Email
    print(email)
    
    if not prompt:
        return jsonify({'error': 'Prompt é obrigatório'}), 400

    # Log do email recebido com sucesso
    if email:
        logger.info(f"Email recebido com sucesso: {email}")

    # Conectar ao banco de dados
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Falha na conexão com o banco de dados'}), 500
    
    try:
        # Consultar o banco de dados para buscar registros do usuário baseado no email
        if email:
            with conn.cursor() as cur:
                cur.execute(""" 
                    SELECT et.text, i.image, i."userId", u.name, u.email
                    FROM "Invoice" i
                    LEFT JOIN "User" u ON i."userId" = u.id
                    LEFT JOIN "ExtractedText" et ON i.id = et."invoiceId"
                    WHERE u.email = %s  -- Filtra os registros pelo email do usuário
                """, (email,))
                rows = cur.fetchall()

            # Verificar se há registros
            if not rows:
                return jsonify({'error': 'Nenhum registro encontrado para este usuário'}), 404

            # Processar os dados retornados
            database_text = " ".join(row[0] for row in rows if row[0])  # Textos extraídos
            invoice_image = rows[0][1]  # Imagem da fatura

            # Se a imagem da fatura existir, extraímos o texto da imagem
            if invoice_image:
                image_text = extract_text_from_image(invoice_image)
                database_text += " " + image_text  # Adiciona o texto da imagem ao banco de dados

            # Traduzir o texto do banco se necessário
            if re.search(r'[a-zA-Z]', database_text):  # Se o texto estiver em inglês ou outro idioma
                database_text = translate_to_portuguese(database_text)

            combined_prompt = f"{prompt}\n{database_text}"

            # Tokenize o prompt com um comprimento maior
            inputs = tokenizer(combined_prompt, return_tensors="pt", truncation=True, padding=True, max_length=1024)

            # Gerar texto com max_new_tokens para evitar o erro de comprimento
            outputs = model.generate(
                inputs['input_ids'], 
                max_new_tokens=300,  # Gera até 300 novos tokens
                no_repeat_ngram_size=2,
                attention_mask=inputs['attention_mask'],  # Atenção configurada
                pad_token_id=tokenizer.pad_token_id  # Usando o token EOS como pad token
            )

            # Decodificando a resposta gerada
            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Limpeza do texto gerado: Remover quebras de linha, espaços extras e outros caracteres indesejados
            generated_text = re.sub(r'\s+', ' ', generated_text).strip()

            # Remover qualquer conteúdo HTML ou código desnecessário da resposta
            generated_text = re.sub(r'<.*?>', '', generated_text)

            # Resposta em português ou inglês dependendo do idioma da pergunta
            if re.search(r'\b(qual|quanto|quanto custa|valor)\b', prompt, re.IGNORECASE):
                # Se a pergunta foi feita em português, garantir a resposta em português
                return jsonify({'generated_text': generated_text})
            else:
                # Se a pergunta foi feita em inglês, retornar em inglês
                return jsonify({'generated_text': generated_text})

        else:
            return jsonify({'error': 'Email não fornecido'}), 400

    except Exception as e:
        print(f"Erro ao executar a consulta ou gerar texto: {e}")
        return jsonify({'error': 'Ocorreu um erro ao processar a requisição'}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
