import React from 'react';

export default function GradientHero() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-5xl font-extrabold text-center leading-tight">
        <span className="bg-gradient-to-r from-[#FF7C4D] to-[#C471F5] text-transparent bg-clip-text">Maraix,</span>
        <span className="inline-block mx-2 align-middle bg-gradient-to-r from-[#C471F5] to-[#3F51B5] text-transparent bg-clip-text">
          Your Best AI Partner
        </span>
        <span className="block mt-2 text-3xl bg-gradient-to-r from-[#3F51B5] to-[#00C6FB] text-transparent bg-clip-text">
          for Ideas, Creation, and Growth!
        </span>
      </h1>
    </div>
  );
}
