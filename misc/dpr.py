from transformers import DPRQuestionEncoderTokenizerFast, DPRQuestionEncoder, DPRContextEncoder,logging
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import ast
logging.set_verbosity_error()


# 自動でトークナイザーを読み込む
tokenizer = DPRQuestionEncoderTokenizerFast.from_pretrained('facebook/dpr-question_encoder-single-nq-base')
question_encoder = DPRQuestionEncoder.from_pretrained('facebook/dpr-question_encoder-single-nq-base')
context_encoder = DPRContextEncoder.from_pretrained('facebook/dpr-ctx_encoder-single-nq-base')


# 質問のエンコード

CONTEXT_FLOW_CREATED=False

def encode_question(question):
    question_inputs = tokenizer(question, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        question_embedding = question_encoder(**question_inputs).pooler_output
    return question_embedding

def encode_context(context):
    context_inputs = tokenizer(context, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        context_embedding = context_encoder(**context_inputs).pooler_output
    return context_embedding


def calc_similarity(question_embedding,context_embeddings,top_k):
    similarities = cosine_similarity(question_embedding.numpy(), context_embeddings.numpy())
    sorted_indices = np.argsort(similarities[0])[::-1]
    if top_k>=len(sorted_indices):
        return sorted_indices
    else:
        return sorted_indices[:top_k]

def context_top_similarities(input_data, context_embeddings, top_k=5):
    if context_embeddings.shape[1]==1:
        return []
    else:
        context_embedding=encode_context(input_data["content"])
        top_datas=calc_similarity(context_embedding,context_embeddings,top_k)
        return top_datas
    
def question_top_similarities(input_data, context_embeddings, top_k=5):
    if context_embeddings.shape[1]==1:
        return []
    else:
        question_embedding=encode_question(input_data["content"])
        top_datas=calc_similarity(question_embedding,context_embeddings,top_k)
        return top_datas

    
def register_context_vec(input_data,context_embeddings):
    if context_embeddings.shape[1]==1:
        return encode_context(input_data["content"])
    else:
        context_embedding=encode_context(input_data["content"])
        context_embeddings=torch.cat((context_embeddings,context_embedding),dim=0)
        return context_embeddings

if __name__=="__main__":
    context_embeddings=torch.tensor([[0]])
    with open("./test_data/1_summery.txt","r") as f:
        content=f.read()
    chatdatas=ast.literal_eval(content)
    for chatdata in chatdatas:
        top=context_top_similarities(chatdata,context_embeddings,3)
        context_embeddings=register_context_vec(chatdata,context_embeddings)
        print(top)
