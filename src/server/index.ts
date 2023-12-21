import request from "./request";

export const setMessage = (data: {
  isFollowUp?: boolean;
  type?: string;
  value?: string;
  systemMessage?: string;
  userMessage?: string;
  assistantMessage?: string;
  Message?: string;
  maxTokens?: string;
  temperature?: string;
  topP?: string;
  frequencyPenalty?: string;
  presencePenalty?: string;
  // words: string[];
}) =>
  request({
    method: "POST",
    url: "/users/setMessage",
    data,
    timeout: 300000, // 设置请求超时时间为10秒
  });

export const setEvaluate = (data: {
  chatId: string;
  type: string;
  problemList: object[];
}) =>
  request({
    method: "POST",
    url: "/users/setEvaluate",
    data,
  });

export const setClearChat = (data: { isClear: boolean }) =>
  request({
    method: "POST",
    url: "/users/setClearChat",
    data,
  });
