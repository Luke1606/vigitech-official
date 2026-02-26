import type React from 'react';
interface ErrorProps {
    errorTitle: string, 
    errorDescription: string
}

export const Error: React.FC<ErrorProps> = ({ 
    errorTitle, 
    errorDescription='' 
}) => {

    return (
        <div className='error-container'>
            <h1 
                className='error-title'
                >
                {errorTitle}
            </h1>

            <img
                className='error-icon' 
                src="/error.png" 
                alt='ícono de error'
                />
            
            <p 
                className='error-text'
                >
                {errorDescription}
            </p>
            
            <button 
                className='accept-button'
                onClick={() => window.location.href = '/'}
                >
                Volver
            </button>
        </div>
    )
};