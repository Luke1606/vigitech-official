import type { ServiceCardProps } from ".";

export const ServiceCard: React.FC<ServiceCardProps> = ({
    imageSrc,
    title,
    alt,
    description,
}) => {
    return (
        <figure className='flex justify-between items-center gap-x-5'>
            <img 
                className='w-20 h-20'
                src= {imageSrc}
                title={title}
                alt={alt} 
                />

            <figcaption>
                <h3 className="font-semibold text-base sm:text-lg">
                    {title}
                </h3>

                <p className="text-sm text-gray-700">
                    {description}
                </p>
            </figcaption>
        </figure>
    )
}