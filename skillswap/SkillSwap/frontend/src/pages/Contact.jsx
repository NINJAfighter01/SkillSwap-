import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendContactForm } from '../services/api';

const Contact = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (data) => {
        try {
            await sendContactForm(data);
            setSuccessMessage('Your message has been sent successfully!');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('There was an error sending your message. Please try again.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block">Name</label>
                    <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        className={`input ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block">Email</label>
                    <input
                        type="email"
                        id="email"
                        {...register('email', { required: 'Email is required' })}
                        className={`input ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="message" className="block">Message</label>
                    <textarea
                        id="message"
                        {...register('message', { required: 'Message is required' })}
                        className={`input ${errors.message ? 'border-red-500' : ''}`}
                    />
                    {errors.message && <p className="text-red-500">{errors.message.message}</p>}
                </div>
                <button type="submit" className="btn">Send Message</button>
            </form>
            {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        </div>
    );
};

export default Contact;