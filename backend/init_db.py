#!/usr/bin/env python3
"""
데이터베이스 초기화 및 테스트 데이터 생성 스크립트
"""

import sys
from datetime import datetime, timedelta

from database import init_db, SessionLocal
from models import Holdings, Transactions
from services.forex_service import ForexService

forex_service = ForexService()


def create_test_data():
    """테스트 데이터 생성"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("📊 Investment Portfolio Dashboard - 초기화")
        print("=" * 60)
        
        print("\n🗄️ 데이터베이스 테이블 생성 중...")
        init_db()
        
        # 환율 조회
        exchange_rate = forex_service.get_usd_to_krw()
        if not exchange_rate:
            exchange_rate = 1320.0  # 기본값
            print(f"⚠️ 환율 API 실패 - 기본값 사용: {exchange_rate}원")
        else:
            print(f"✅ 환율 조회 성공: {exchange_rate:.2f}원")
        
        print("\n📊 테스트 데이터 생성 중...")
        
        # 테스트 종목 추가
        test_holdings = [
            {"ticker": "VOO", "name": "Vanguard S&P 500 ETF"},
            {"ticker": "QQQ", "name": "Invesco QQQ Trust"},
            {"ticker": "AAPL", "name": "Apple Inc."},
            {"ticker": "SCHD", "name": "Schwab US Dividend Equity ETF"},
        ]
        
        for holding_data in test_holdings:
            # 종목 추가
            holding = Holdings(**holding_data)
            db.add(holding)
            db.flush()
            
            # 거래 내역 추가 (30일 전 매수)
            if holding_data["ticker"] == "VOO":
                price = 445.0
                shares = 10.0
            elif holding_data["ticker"] == "QQQ":
                price = 380.0
                shares = 8.0
            elif holding_data["ticker"] == "AAPL":
                price = 185.0
                shares = 15.0
            else:  # SCHD
                price = 26.5
                shares = 20.0
            
            transaction = Transactions(
                ticker=holding_data["ticker"],
                type="BUY",
                shares=shares,
                price_usd=price,
                exchange_rate=exchange_rate,
                transaction_time=datetime.now() - timedelta(days=30)
            )
            db.add(transaction)
            print(f"  ✅ {holding_data['ticker']}: {shares}주 @ ${price}")
        
        db.commit()
        
        print("\n" + "=" * 60)
        print("✅ 테스트 데이터 생성 완료!")
        print("=" * 60)
        print("\n📋 생성된 데이터:")
        print(f"  - VOO: 10주 @ $445.0")
        print(f"  - QQQ: 8주 @ $380.0")
        print(f"  - AAPL: 15주 @ $185.0")
        print(f"  - SCHD: 20주 @ $26.5")
        print(f"  - 환율: {exchange_rate:.2f}원")
        print("\n🚀 서버 시작: python main.py")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("📊 Investment Portfolio Dashboard - 초기화")
    print("=" * 60)
    
    response = input("\n테스트 데이터를 생성하시겠습니까? (y/n): ")
    
    if response.lower() == 'y':
        create_test_data()
    else:
        print("\n🗄️ 데이터베이스 테이블만 생성합니다...")
        init_db()
        print("✅ 완료!")


if __name__ == "__main__":
    main()
