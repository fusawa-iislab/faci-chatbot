import React from 'react';
import ParticipantBot, { ParticipantBotProps } from './index';
import { Meta } from '@storybook/react';
import { Participant } from '../../assets/structs';

// サンプルデータ
const participant: Participant = {
  id: 1,
  name: 'Alice',
  persona: 'Friendly',
};

// Storybook メタデータ
export default {
  title: 'Components/ParticipantBot',
  component: ParticipantBot,
} as Meta;

export const Default = () => (
  <ParticipantBot p={participant} socket={null}/>
);

export const WithComment = () => (
  <ParticipantBot p={participant} socket={null}/>
);

export const WithoutComment = () => (
  <ParticipantBot p={participant} socket={null}/>
);
