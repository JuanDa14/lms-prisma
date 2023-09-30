import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function POST(request: Request) {
	try {
		const { userId } = auth();

		const { title } = await request.json();

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const course = await db.course.create({
			data: {
				userId,
				title,
			},
		});

		return NextResponse.json(course);
	} catch (error) {
		console.log('[COURSES]', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
