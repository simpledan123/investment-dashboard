from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.deps import get_db_session
from crud import transaction as crud_transaction
from schemas import (
    TransactionCreate,
    TransactionResponse,
    TransactionListResponse,
    MessageResponse
)

router = APIRouter()


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db_session)
):
    """거래 입력 (매수/매도)"""
    try:
        new_transaction = crud_transaction.create_transaction(db, transaction)
        
        return MessageResponse(
            message="거래가 성공적으로 등록되었습니다",
            detail=f"{transaction.ticker} {transaction.type} {transaction.shares}주"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"거래 등록 실패: {str(e)}"
        )


@router.get("/", response_model=TransactionListResponse)
async def read_transactions(
    ticker: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db_session)
):
    """거래 내역 조회"""
    if ticker:
        transactions = crud_transaction.get_transactions_by_ticker(
            db, ticker, skip, limit
        )
        total_count = crud_transaction.get_transaction_count(db, ticker)
    else:
        transactions = crud_transaction.get_all_transactions(db, skip, limit)
        total_count = crud_transaction.get_transaction_count(db)
    
    # Response 변환
    transactions_data = []
    for t in transactions:
        transactions_data.append(TransactionResponse(
            id=t.id,
            ticker=t.ticker,
            type=t.type,
            shares=float(t.shares),
            price_usd=float(t.price_usd),
            exchange_rate=float(t.exchange_rate),
            transaction_time=t.transaction_time,
            total_krw=float(t.shares * t.price_usd * t.exchange_rate),
            created_at=t.created_at
        ))
    
    return TransactionListResponse(
        transactions=transactions_data,
        total_count=total_count
    )


@router.delete("/{transaction_id}", response_model=MessageResponse)
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db_session)
):
    """거래 삭제"""
    success = crud_transaction.delete_transaction(db, transaction_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"거래 ID {transaction_id}를 찾을 수 없습니다"
        )
    
    return MessageResponse(
        message="거래가 삭제되었습니다",
        detail=f"Transaction ID: {transaction_id}"
    )
