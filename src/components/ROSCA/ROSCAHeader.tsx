import React from 'react';

interface ROSCAHeaderProps {
  userName: string;
}

const ROSCAHeader: React.FC<ROSCAHeaderProps> = ({ userName }) => {
  return (
    <div className="text-center mb-12">
      {/* Header content removed as requested */}
    </div>
  );
};

export default ROSCAHeader;
