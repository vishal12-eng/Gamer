import React from 'react';

interface AiFeatureBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const AiFeatureBox: React.FC<AiFeatureBoxProps> = ({ title, icon, children }) => {
  return (
    <div className="relative mt-12 p-[1px] bg-gradient-to-br from-cyan-500/50 via-transparent to-purple-500/50 rounded-2xl">
      <div className="p-6 bg-gray-900/80 backdrop-blur-sm rounded-[15px]">
        <h3 className="flex items-center text-2xl font-bold mb-4 text-white">
          <span className="mr-3 bg-gray-800 p-2 rounded-full border border-white/10">{icon}</span>
          {title}
        </h3>
        <div className="border-t border-white/10 pt-4 mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AiFeatureBox;
