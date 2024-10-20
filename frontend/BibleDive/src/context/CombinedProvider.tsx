import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { ChatProvider } from './ChatContext';
import { MessageProvider } from './MessageContext';
import { TopicPlanProvider } from './TopicPlanContext';
import { LessonProvider } from './LessonContext';
import { TestProvider } from './TestContext';

interface CombinedProviderProps {
  children: ReactNode;
}

const combineProviders = (providers) => ({ children }) =>
  providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );

const providers = [
  AuthProvider,
  UserProvider,
  ChatProvider,
  MessageProvider,
  TopicPlanProvider,
  LessonProvider,
  TestProvider,
];

const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  const Combined = combineProviders(providers);
  return <Combined>{children}</Combined>;
};

export default CombinedProvider;
