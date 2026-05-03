import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { LikkleVideoPlan } from '../../lib/youtube/video-types';

export const sampleVideoPlan: LikkleVideoPlan = {
  id: 'sample',
  title: 'Drinking Water with Tanty Spice',
  island: 'Trinidad and Tobago',
  ageBand: '3-5',
  learningGoal: 'Kids learn why drinking water helps them play, dance, and think.',
  hook: 'Can you drink water like a Likkle Legend?',
  musicAssetId: 'drinking-water',
  characterAssetIds: ['likkle-legends-group', 'tanty-spice'],
  scenes: [
    {
      title: 'Hello',
      narration: 'Come quick, Likkle Legends!',
      caption: 'Come quick, Likkle Legends!',
      visualPrompt: 'Bright Caribbean beach classroom.',
      characterAssetIds: ['likkle-legends-group'],
      durationSeconds: 10,
    },
    {
      title: 'Water',
      narration: 'Water helps we body dance and play.',
      caption: 'Water helps us dance and play.',
      visualPrompt: 'Tanty Spice teaching healthy habits.',
      characterAssetIds: ['tanty-spice'],
      durationSeconds: 10,
    },
    {
      title: 'Repeat',
      narration: 'Sip, smile, and say hooray!',
      caption: 'Sip, smile, hooray!',
      visualPrompt: 'Kids safe animated repeat moment.',
      characterAssetIds: ['doubles-character'],
      durationSeconds: 10,
    },
  ],
  youtube: {
    title: 'Drinking Water with Tanty Spice | Likkle Legends',
    description: 'A Caribbean kids learning short.',
    tags: ['Caribbean kids', 'healthy habits'],
    madeForKids: true,
    privacyStatus: 'private',
  },
  safety: {
    coppaSafe: true,
    noPersonalData: true,
    noRealChildVoiceClone: true,
    needsHumanApproval: true,
  },
};

const characterMap: Record<string, string> = {
  'likkle-legends-group': '/assets/youtube/characters/likkle-legends-group.png',
  'pepper-character': '/assets/youtube/characters/pepper-character.png',
  'tanty-spice': '/assets/youtube/characters/tanty-spice.png',
  'doubles-character': '/assets/youtube/characters/doubles-character.png',
};

const musicMap: Record<string, string> = {
  'saving-money': '/assets/youtube/music/saving-money.mp3',
  'drinking-water': '/assets/youtube/music/drinking-water.mp3',
};

const assetFile = (path: string) => staticFile(path.replace(/^\//, ''));

export const LikkleShort: React.FC<{ plan: LikkleVideoPlan }> = ({ plan }) => {
  const frame = useCurrentFrame();
  const float = interpolate(Math.sin(frame / 18), [-1, 1], [-18, 18]);
  let start = 0;

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #52c7ff 0%, #fff3b0 58%, #25b87a 100%)', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      {plan.musicAssetId && musicMap[plan.musicAssetId] ? <Audio src={assetFile(musicMap[plan.musicAssetId])} volume={0.45} /> : null}
      <div style={{ position: 'absolute', top: 90, left: 70, right: 70, color: '#10233f', fontSize: 56, fontWeight: 900, textAlign: 'center', textShadow: '0 5px 0 rgba(255,255,255,.55)' }}>
        {plan.hook}
      </div>
      {plan.scenes.map((scene, index) => {
        const duration = Math.max(90, scene.durationSeconds * 30);
        const asset = characterMap[scene.characterAssetIds[0]] || characterMap['likkle-legends-group'];
        const currentStart = start;
        start += duration;
        return (
          <Sequence key={scene.title} from={currentStart} durationInFrames={duration}>
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 72 }}>
              <Img src={assetFile(asset)} style={{ width: index === 0 ? 930 : 760, maxHeight: 1120, objectFit: 'contain', transform: `translateY(${float}px)`, filter: 'drop-shadow(0 30px 30px rgba(0,0,0,.24))' }} />
              <div style={{ position: 'absolute', left: 54, right: 54, bottom: 140, background: 'rgba(7,9,16,.82)', border: '6px solid #ffd23f', borderRadius: 34, padding: '34px 42px', color: 'white', fontSize: 52, fontWeight: 900, textAlign: 'center', lineHeight: 1.12 }}>
                {scene.caption}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <div style={{ position: 'absolute', left: 58, right: 58, bottom: 42, color: '#10233f', fontSize: 34, fontWeight: 900, textAlign: 'center' }}>
        Learn more at LikkleLegends.com
      </div>
    </AbsoluteFill>
  );
};
