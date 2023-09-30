'use client';

import { useState } from 'react';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { Course } from '@prisma/client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combox';
import { cn } from '@/lib/utils';

interface CategoryFormProps {
	initialData: Course;
	courseId: string;
	options: { label: string; value: string }[];
}

const formSchema = z.object({
	categoryId: z.string().min(1),
});

export const CategoryForm = ({ initialData, courseId, options }: CategoryFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const router = useRouter();

	const toogleEdit = () => setIsEditing((currentValue) => !currentValue);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			categoryId: initialData?.categoryId || options[0].value,
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.patch(`/api/courses/${courseId}`, values);
			router.refresh();
			toogleEdit();
			toast.success('Course updated');
		} catch {
			toast.error('Something went wrong');
		}
	};

	const selectedOption = options.find((option) => option.value === initialData.categoryId);

	return (
		<div className='mt-6 border bg-slate-100 rounded-md p-4'>
			<div className='font-medium flex items-center justify-between'>
				Course category
				<Button variant={'ghost'} onClick={toogleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<Pencil className='h-4 w-4 mr-2' />
							Edit category
						</>
					)}
				</Button>
			</div>
			{!isEditing && (
				<p className={cn('text-sm mt-2', !initialData.description && 'text-slate-500 italic')}>
					{selectedOption?.label || 'No category'}
				</p>
			)}
			{isEditing && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='categoryId'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Combobox options={options} {...field} />
									</FormControl>
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
