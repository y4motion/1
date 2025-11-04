from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from datetime import datetime, timezone

from models.question import Question, QuestionCreate, QuestionResponse, Answer, AnswerCreate
from utils.auth_utils import get_current_user
from database import db

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(question_data: QuestionCreate, current_user: dict = Depends(get_current_user)):
    """
    Ask a question about a product
    """
    # Check if product exists
    product = await db.products.find_one({"id": question_data.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get user info
    user = await db.users.find_one({"id": current_user["id"]})
    
    # Create question
    question = Question(
        **question_data.model_dump(),
        user_id=current_user["id"],
        username=user.get("username", "Anonymous"),
        user_avatar=user.get("avatar_url")
    )
    
    # Serialize datetime
    question_dict = question.model_dump()
    question_dict['created_at'] = question_dict['created_at'].isoformat()
    
    await db.questions.insert_one(question_dict)
    
    return QuestionResponse(**question.model_dump())


@router.get("/product/{product_id}", response_model=List[QuestionResponse])
async def get_product_questions(
    product_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get all questions for a product
    """
    questions = await db.questions.find(
        {"product_id": product_id, "status": "active"},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Parse datetime
    for question in questions:
        if isinstance(question.get('created_at'), str):
            question['created_at'] = datetime.fromisoformat(question['created_at'])
        
        # Parse answers datetime
        for answer in question.get('answers', []):
            if isinstance(answer.get('created_at'), str):
                answer['created_at'] = datetime.fromisoformat(answer['created_at'])
    
    return [QuestionResponse(**q) for q in questions]


@router.post("/{question_id}/answers", status_code=status.HTTP_201_CREATED)
async def create_answer(
    question_id: str,
    answer_data: AnswerCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Answer a question
    """
    # Check if question exists
    question = await db.questions.find_one({"id": question_id})
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Get user info
    user = await db.users.find_one({"id": current_user["id"]})
    
    # Check if answering user is the seller
    product = await db.products.find_one({"id": question["product_id"]})
    is_seller = product and product.get("seller_id") == current_user["id"]
    
    # Create answer
    answer = Answer(
        **answer_data.model_dump(),
        user_id=current_user["id"],
        username=user.get("username", "Anonymous"),
        user_avatar=user.get("avatar_url"),
        is_seller=is_seller
    )
    
    # Serialize datetime
    answer_dict = answer.model_dump()
    answer_dict['created_at'] = answer_dict['created_at'].isoformat()
    
    # Add answer to question
    await db.questions.update_one(
        {"id": question_id},
        {"$push": {"answers": answer_dict}}
    )
    
    return {"message": "Answer added successfully", "answer": answer_dict}


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a question (only by author or admin)
    """
    question = await db.questions.find_one({"id": question_id})
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check permissions
    user = await db.users.find_one({"id": current_user["id"]})
    if question["user_id"] != current_user["id"] and not user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this question"
        )
    
    # Soft delete
    await db.questions.update_one({"id": question_id}, {"$set": {"status": "archived"}})
    
    return {"message": "Question deleted successfully"}
