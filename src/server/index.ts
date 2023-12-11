import request from "./request";

export const setMessage = (data: {
  isFollowUp: boolean;
  type: string;
  value: string;
  // words: string[];
}) =>
  request({
    method: "POST",
    url: "/users/setMessage",
    data,
    timeout: 100000, // 设置请求超时时间为10秒
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
