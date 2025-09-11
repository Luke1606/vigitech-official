import React, { type ErrorInfo } from 'react'
import { Error } from './Error'

/**
 * @description Clase interceptora de todo error ocurrido en la aplicación. Busca captar los errores y 
 * renderizarlos en el componente {@link Error}.
 */
export class ErrorBoundary extends React.Component {
    state: { hasError: boolean, message: string };
    private children: React.ReactNode;

    constructor(props: { children?: React.ReactNode }) {
        super(props)
        this.children = props?.children;
        this.state = { hasError: false, message: '' }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, message: error.message }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error capturado en ErrorBoundary:', error, errorInfo)
        
        if (error.message.includes('navigation')) {
            console.warn('Error relacionado con React Router detectado.')
        }
    }
    

    render() {
        if (this.state.hasError) {
            const isNetworkError = this.state.message.includes('HTTP Error')
            return (
                <Error
                    errorTitle={isNetworkError ? 'Error de red' : 'Algo salió mal'}
                    errorDescription={this.state.message || 'Ha ocurrido un error inesperado.'}
                />
            )
        }
        return this?.children;
    }
}