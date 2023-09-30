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
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/format';

interface PriceFormProps {
	initialData: Course;
	courseId: string;
}

const formSchema = z.object({
	price: z.coerce.number(),
});

export const PriceForm = ({ initialData, courseId }: PriceFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const router = useRouter();

	const toogleEdit = () => setIsEditing((currentValue) => !currentValue);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			price: initialData?.price || undefined,
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

	return (
		<div className='mt-6 border bg-slate-100 rounded-md p-4'>
			<div className='font-medium flex items-center justify-between'>
				Course price
				<Button variant={'ghost'} onClick={toogleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<Pencil className='h-4 w-4 mr-2' />
							Edit price
						</>
					)}
				</Button>
			</div>
			{!isEditing && (
				<p className={cn('text-sm mt-2', !initialData.price && 'text-slate-500 italic')}>
					{initialData.price ? formatPrice(initialData.price) : 'No price'}
				</p>
			)}
			{isEditing && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='price'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											type='number'
											step={0.01}
											{...field}
											placeholder='e.g 10.99'
											disabled={isSubmitting}
										/>
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
