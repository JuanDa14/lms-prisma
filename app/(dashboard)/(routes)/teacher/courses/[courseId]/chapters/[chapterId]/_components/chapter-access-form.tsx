'use client';

import { useState } from 'react';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

import { Chapter } from '@prisma/client';
import { cn } from '@/lib/utils';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ChapterAccessFormProps {
	initialData: Chapter;
	courseId: string;
	chapterId: string;
}

const formSchema = z.object({
	isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({ initialData, courseId, chapterId }: ChapterAccessFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const router = useRouter();

	const toogleEdit = () => setIsEditing((currentValue) => !currentValue);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			isFree: !!initialData.isFree,
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
			router.refresh();
			toogleEdit();
			toast.success('Chapter updated');
		} catch {
			toast.error('Something went wrong');
		}
	};

	return (
		<div className='mt-6 border bg-slate-100 rounded-md p-4'>
			<div className='font-medium flex items-center justify-between'>
				Chapter access
				<Button variant={'ghost'} onClick={toogleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<Pencil className='h-4 w-4 mr-2' />
							Edit access
						</>
					)}
				</Button>
			</div>
			{!isEditing && (
				<div className={cn('text-sm mt-2', !initialData.isFree && 'text-slate-500 italic')}>
					{initialData.isFree ? (
						<>This chapter is free for everyone</>
					) : (
						<>This chapter is not free for everyone</>
					)}
				</div>
			)}
			{isEditing && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='isFree'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormDescription>
											Check this if you want to make this chapter free
										</FormDescription>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='mt-4 flex items-center gap-x-2'>
							<Button type='submit' disabled={isSubmitting || !isValid}>
								Save
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
};
