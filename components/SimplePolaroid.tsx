import React from 'react';

interface SimplePolaroidProps {
    imageUrl?: string;
    caption: string;
}

const SimplePolaroid: React.FC<SimplePolaroidProps> = ({ imageUrl, caption }) => {
    return (
        <div className="bg-white p-4 pb-16 shadow-lg rounded-md w-80 relative">
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center overflow-hidden">
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
            <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="font-bold text-black">{caption}</p>
            </div>
        </div>
    );
};

export default SimplePolaroid;