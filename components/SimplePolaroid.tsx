import React from 'react';

interface SimplePolaroidProps {
    imageUrl?: string;
    caption: string;
}

const SimplePolaroid: React.FC<SimplePolaroidProps> = ({ imageUrl, caption }) => {
    return (
        <div className="bg-white p-3 sm:p-4 pb-12 sm:pb-16 shadow-lg rounded-md w-64 sm:w-72 md:w-80 relative">
            <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={caption}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('Simple image loaded')}
                        onError={(e) => console.error('Simple image failed:', e)}
                    />
                ) : (
                    <span className="text-gray-500">No image</span>
                )}
            </div>
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-center">
                <p className="font-permanent-marker text-base sm:text-lg text-black">{caption}</p>
            </div>
        </div>
    );
};

export default SimplePolaroid;