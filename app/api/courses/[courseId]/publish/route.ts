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
			include: {
				chapters: {
					include: {
						muxData: true,
					},
				},
			},
		});

		if (!course) {
			return new NextResponse('Not found', { status: 404 });
		}

		const hasPublishedChapter = course.chapters.some((chapter) => chapter.isPublished);

		if (
			!course.title ||
			!course.description ||
			!course.imageUrl ||
			!course.categoryId ||
			!hasPublishedChapter
		) {
			return new NextResponse('Missing required fields', { status: 400 });
		}

		const publishCourse = await db.course.update({
			where: {
				id: params.courseId,
				userId,
			},
			data: {
				isPublished: true,
			},
		});

		return NextResponse.json(publishCourse);
	} catch (error) {
		console.log('[COURSEID PUBLISH]', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
