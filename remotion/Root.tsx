import React from 'react';
import { Composition } from 'remotion';
import { LikkleShort, sampleVideoPlan } from './compositions/LikkleShort';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LikkleShort"
      component={LikkleShort}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ plan: sampleVideoPlan }}
    />
  );
};
