import api from './api.service';
import type { Feedback } from '../types/product.types';
import type { CreateFeedbackDTO } from '../types/feedback.types'; // (Bạn sẽ cần tạo file này)

const postFeedback = async (data: CreateFeedbackDTO): Promise<Feedback> => {
    const res = await api.post('/feedback', data);
    return res.data;
};

export const feedbackService = {
    postFeedback,
};