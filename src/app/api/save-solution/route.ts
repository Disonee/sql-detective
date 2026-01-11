// app/api/save-solution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveUserSolution } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, query, isCorrect } = body;
    
    if (!caseId || !query) {
      return NextResponse.json(
        { success: false, message: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }
    
    await saveUserSolution(caseId, query, isCorrect);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Решение сохранено' 
    });
  } catch (error: any) {
    console.error('Ошибка при сохранении решения:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при сохранении' },
      { status: 500 }
    );
  }
}