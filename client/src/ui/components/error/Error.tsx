import type React from 'react';
import error from '/error.png'
import { useNavigate } from 'react-router-dom';

interface ErrorProps {
    errorTitle: string, 
    errorDescription: string
}

export const Error: React.FC<ErrorProps> = ({ 
    errorTitle, 
    errorDescription='' 
}) => {

    const navigate = useNavigate();
    
    return (
        <div className='error-container'>
            <h1 
                className='error-title'
                >
                {errorTitle}
            </h1>

            <img
                className='error-icon' 
                src={error} 
                alt='ícono de error'
                />
            
            <p 
                className='error-text'
                >
                {errorDescription}
            </p>
            
            <button 
                className='accept-button'
                onClick={() => navigate('/')}
                >
                Volver
            </button>
        </div>
    )
};