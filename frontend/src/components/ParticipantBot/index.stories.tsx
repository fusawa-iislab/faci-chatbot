import React from 'react';
import ParticipantBot, { ParticipantBotProps } from './index';
import { Meta } from '@storybook/react';
import { Participant } from '../../assets/structs';

// サンプルデータ
const participant: Participant = {
  id: 1,
  name: 'Alice',
  persona: 'Friendly',
  background: 'Software Engineer',
};

// Storybook メタデータ
export default {
  title: 'Components/ParticipantBot',
  component: ParticipantBot,
} as Meta;

export const Default = () => (
  <ParticipantBot p={participant} />
);

export const WithComment = () => (
  <ParticipantBot p={participant}/>
);

export const WithoutComment = () => (
  <ParticipantBot p={participant} />
);
