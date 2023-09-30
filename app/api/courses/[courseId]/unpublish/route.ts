import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import { db } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
	try {
		const { userId } = auth();

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const course = await db.course.findUnique({
			where: {
				userId,
				id: params.courseId,
			},
		});

		if (!course) {
			return new NextResponse('Not found', { status: 404 });
		}

		const unpublishCourse = await db.course.update({
			where: {
				id: params.courseId,
				userId,
			},
			data: {
				isPublished: false,
			},
		});

		return NextResponse.json(unpublishCourse);
	} catch (error) {
		console.log('[COURSEID UNPUBLISH]', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
