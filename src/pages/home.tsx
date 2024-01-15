// 导入userStroe
import { LoadingOutlined, RedditOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Input, message, Space, Avatar, Select, FloatButton } from 'antd'
import { SetStateAction, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setEvaluate, setMessage, } from '../server'
// import { setEvaluate, setMessage, setClearChat } from '../server'
import Markdown, { Components } from 'react-markdown'
import { v4 as uuidv4 } from 'uuid';

import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';

const LinkRenderer = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);

const renderers = {
    link: ({ href, children }: { href?: string, children: React.ReactNode }) => {
        if (href) {
            return <LinkRenderer href={href}>{children}</LinkRenderer>;
        } else {
            return null; // 处理 href 为 undefined 的情况
        }
    },
};



const Home: React.FC = () => {
    const navigate = useNavigate()
    const userName = localStorage.getItem('userName')
    // const [isClear, setIsClear] = useState(false);
    // console.log('isClear: ', isClear);
    const [currentMessage, setcurrentMessage] = useState('')


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<{ type: number, value: string | any }[]>([])
    const [messageType, setmessageType] = useState('')
    //侧边输入的值

    //判断当前是满意还是不满意的回执
    const [flag, setflag] = useState<boolean>(false)
    const iptChange = (value: { target: { value: SetStateAction<string> } }) => {
        setcurrentMessage(value.target.value)
    }

    // 用于操作聊天列表元素的引用
    const chatListRef = useRef(null)


    const addMessage = async () => {
        try {
            if (messageType !== '' && currentMessage.trim() !== '') {

                console.log("开始请求");
                // 判断是第一次提问还是追问
                const isFollowUp = items.length > 1

                setItems([...items, { type: 1, value: currentMessage }, { type: 0, value: '-1' }])

                const res = await setMessage({
                    isFollowUp: isFollowUp,
                    type: messageType,
                    value: currentMessage,
                })
                if (res.data.code === 200) {
                    setTimeout(() => {
                        if (items.length > 4) {
                            setcurrentMessage('')
                        }
                        // setcurrentMessage('')
                        setItems((old) => {

                            const parsedData = res.data.data

                            let markdownString = '';


                            parsedData.forEach((item: any) => {
                                if (item != null) {


                                    if (item.title && item.title.length > 0) {
                                        markdownString += `以下是为您推荐的，比较符合您需求的文档: \n`
                                        markdownString += `### 标题: <a href="${item.detailUrl}" target="_blank">${item.title}</a>\n\n`;
                                    }

                                    // 问题描述
                                    if (item.questions && item.questions.length > 0) {
                                        markdownString += `> ###  问题描述：\n`
                                        markdownString += `>${item.questions}\n\n`;
                                    }

                                    // 如果问题补充存在，就显示
                                    if (item.questionsAdditionalInfo && item.questionsAdditionalInfo.length > 0) {
                                        markdownString += `> ###  问题补充描述：\n`
                                        markdownString += `> ${item.questionsAdditionalInfo}\n\n`;
                                    }

                                    // 处理问题图片
                                    if (item.questionsPicture && item.questionsPicture.length > 0) {

                                        let questionsPicture = 1;

                                        item.questionsPicture.forEach((picUrl: any) => {
                                            // 添加链接前缀，创建Markdown格式图片链接
                                            const imageUrl = `https://www.ad.siemens.com.cn${picUrl}`;

                                            // 生成Markdown格式的图片
                                            markdownString += `>  <a href="${imageUrl}" target="_blank">问题图片${questionsPicture}:</a>\n\n`
                                            markdownString += `> <img src="${imageUrl}" alt="问题图片${questionsPicture}" width="400">\n\n`;
                                            questionsPicture++;
                                        });
                                    }
                                    // 回答
                                    if (item.answer && item.answer.length > 0) {
                                        markdownString += `> ###  回答：\n`
                                        markdownString += `>${item.answer}\n\n`;
                                    }

                                    // 处理回答图片
                                    if (item.answerPicture && item.answerPicture.length > 0) {
                                        let answerPicture = 1;

                                        item.answerPicture.forEach((picUrl: any) => {
                                            // 添加链接前缀，创建 Markdown 格式图片链接
                                            const imageUrl = `https://www.ad.siemens.com.cn${picUrl}`;


                                            // 生成Markdown格式的图片
                                            markdownString += `>  <a href="${imageUrl}" target="_blank">回答图片${answerPicture}:</a>\n\n`
                                            markdownString += `> <img src="${imageUrl}" alt="回答图片${answerPicture}" width="400">\n\n`;
                                            answerPicture++;

                                        });
                                    }

                                    // 信息描述
                                    if (item.description && item.description.length > 0) {
                                        markdownString += `> ###  信息：\n`
                                        markdownString += `> ${item.description}\n\n`;
                                    }

                                    // 文档下载类gpt回复
                                    if (item.documentResult) {
                                        console.log('item.documentResult: ', item.documentResult);
                                        markdownString += `${item.documentResult}`;
                                    }

                                    // 故障代码类gpt回复
                                    if (item.faultResult) {
                                        markdownString += item.faultResult;
                                    }

                                    // 直接问询gpt回复
                                    if (item.gptresult) {
                                        markdownString += item.gptresult;
                                    }

                                }
                                // 如果有其他字段需要在 Markdown 中展示，可以在这里继续追加
                            });


                            const oldmew = old.slice(0, old.length - 1)
                            const newValue = [...oldmew, { type: 0, value: markdownString }]

                            return newValue
                        })
                    }, 1000)
                }
            }
        } catch (error: any) {
            console.log('error: ', error.response.data.code);
            setItems((old) => {

                const markdownString = '对不起，我是VxE虚拟工程师，只能提供有关西门子设备的帮助。请检查输入的内容并重新提问';

                const oldmew = old.slice(0, old.length - 1)
                const newValue = [...oldmew, { type: 0, value: markdownString }]

                return newValue
            })
        }
    }


    const handleChange = (value: string, option: { value: string, label: string, msg: string } | { value: string, label: string, msg: string }[]) => {
        if (Array.isArray(option)) {
            // 如果是数组形式的参数，可以在这里处理
        } else {
            setItems([{ type: 0, value: option.msg }])
            setmessageType(value)
        }
    };
    useEffect(() => {
        if (userName === null) {
            navigate('/login')
            message.error('登录信息过期，请重新登录！');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    const setEvaluateHandler = async (behavior: string, index: number) => {

        // console.log('behavior: ', behavior);
        const res = await setEvaluate({
            messageName: items[(index - 1)].value,
            messageType,
            chatId: uuidv4(),
            type: behavior,
            problemList: items.slice(1, index + 1),
        })
        if (behavior === 'down') {
            addMessage(); // 这里假设 addMessage 是你想调用的方法
            setcurrentMessage(items[(index - 1)].value)
        }
        if (res.data.code === 200) {
            message.success('反馈成功！');
        }

    };
    useEffect(() => {
        const current: { scrollTop: unknown, scrollHeight: unknown } = chatListRef.current!
        //scrollHeight是页面的高度
        current.scrollTop = current.scrollHeight
        console.log('current.scrollHeight: ', current.scrollHeight);
    }, [items])

    useEffect(() => {
        if (messageType.trim() !== '' && currentMessage.trim() !== '') {
            if (messageType === '2') {
                if (currentMessage.trim().includes(':') && currentMessage.trim().split(':')[0].length > 0 && currentMessage.trim().split(':')[1].length > 0) {
                    setflag(true)
                } else {
                    setflag(false)
                }
            } else {
                setflag(true)
            }

        } else {
            setflag(false)
        }
    }, [currentMessage, messageType])


    // type FieldType = {
    //     systemMessage?: string;
    //     userMessage?: string,
    //     assistantMessage?: string,
    //     Message?: string;
    //     maxTokens?: string;
    //     temperature?: string;
    //     topP?: string;
    //     frequencyPenalty?: string;
    //     presencePenalty?: string;

    // };

    // const onFinish = async (values: FieldType) => {
    //     console.log('Success:', values);
    //     const res = await setMessage({
    //         ...values,
    //         type: "4",
    //         isFollowUp: false
    //     })
    //     if (res.data.code === 200) {
    //         setTimeout(() => {
    //             if (items.length > 4) {
    //                 setcurrentMessage('')
    //             }
    //             // setcurrentMessage('')
    //             setItems((old) => {

    //                 const parsedData = res.data.data

    //                 let markdownString = '';


    //                 parsedData.forEach((item: any) => {
    //                     if (item != null) {
    //                         // 标题
    //                         if (item.title && item.title.length > 0) {
    //                             markdownString += `以下是为您推荐的，与您问题相关性最高的回答: \n`
    //                             markdownString += `### 标题: <a href="${item.detailUrl}" target="_blank">${item.title}</a>\n\n`;
    //                         }

    //                         // 问题描述
    //                         if (item.questions && item.questions.length > 0) {
    //                             markdownString += `> ###  问题描述：\n`
    //                             markdownString += `>${item.questions}\n\n`;
    //                         }

    //                         // 如果问题补充存在，就显示
    //                         if (item.questionsAdditionalInfo && item.questionsAdditionalInfo.length > 0) {
    //                             markdownString += `> ###  问题补充描述：\n`
    //                             markdownString += `> ${item.questionsAdditionalInfo}\n\n`;
    //                         }

    //                         // 处理问题图片
    //                         if (item.questionsPicture && item.questionsPicture.length > 0) {

    //                             let questionsPicture = 1;

    //                             item.questionsPicture.forEach((picUrl: any) => {
    //                                 // 添加链接前缀，创建Markdown格式图片链接
    //                                 const imageUrl = `https://www.ad.siemens.com.cn${picUrl}`;

    //                                 // 生成Markdown格式的图片
    //                                 markdownString += `>  <a href="${imageUrl}" target="_blank">问题图片${questionsPicture}:</a>\n\n`
    //                                 markdownString += `> <img src="${imageUrl}" alt="问题图片${questionsPicture}" width="400">\n\n`;
    //                                 questionsPicture++;
    //                             });
    //                         }
    //                         // 回答
    //                         if (item.answer && item.answer.length > 0) {
    //                             markdownString += `> ###  回答：\n`
    //                             markdownString += `>${item.answer}\n\n`;
    //                         }

    //                         // 处理回答图片
    //                         if (item.answerPicture && item.answerPicture.length > 0) {
    //                             let answerPicture = 1;

    //                             item.answerPicture.forEach((picUrl: any) => {
    //                                 // 添加链接前缀，创建 Markdown 格式图片链接
    //                                 const imageUrl = `https://www.ad.siemens.com.cn${picUrl}`;


    //                                 // 生成Markdown格式的图片
    //                                 markdownString += `>  <a href="${imageUrl}" target="_blank">回答图片${answerPicture}:</a>\n\n`
    //                                 markdownString += `> <img src="${imageUrl}" alt="回答图片${answerPicture}" width="400">\n\n`;
    //                                 answerPicture++;

    //                             });
    //                         }

    //                         // 文档详情描述
    //                         if (item.introduce && item.introduce.length > 0) {
    //                             markdownString += `> ###  文档详情：\n`
    //                             markdownString += `> ${item.introduce}\n\n`;
    //                         }

    //                         // gpt回复
    //                         if (item.gptresult && item.gptresult.length > 0) {
    //                             markdownString += `${item.gptresult}\n\n`;
    //                         }

    //                     }
    //                     // 如果有其他字段需要在 Markdown 中展示，可以在这里继续追加
    //                 });


    //                 const oldmew = old.slice(0, old.length - 1)
    //                 const newValue = [...oldmew, { type: 0, value: markdownString }]

    //                 return newValue
    //             })
    //         }, 1000)
    //     }
    // };

    // const handleNewChat = () => {
    //     setIsClear(true);
    //     setItems([])
    //     setClearChat({ isClear: true });
    // };



    const avatar = <Avatar style={{ backgroundColor: '#0070c0', }} icon={<UserOutlined />} />
    const avatarAi = <Avatar style={{ backgroundColor: '#19c37d', width: "35px", height: "35px",marginTop:"10px" }} icon={<RedditOutlined />} />


    return (
        <div className="home">
            <div className='left'>
                {/* <Form
                    layout="vertical"
                    name="basic"
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item<FieldType>
                        label="系统信息"
                        name="systemMessage"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="用户提问信息例子"
                        name="userMessage"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="助手回答信息例子"
                        name="assistantMessage"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="提问"
                        name="Message"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="最大响应数"
                        name="maxTokens"
                        rules={[{ required: true, message: 'Please input your maxTokens!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="温度"
                        name="temperature"
                        rules={[{ required: true, message: 'Please input your temperature!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="顶部 P "
                        name="topP"
                        rules={[{ required: true, message: 'Please input your topP!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="频率损失"
                        name="frequencyPenalty"
                        rules={[{ required: true, message: 'Please input your frequencyPenalty!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="状态惩罚"
                        name="presencePenalty"
                        rules={[{ required: true, message: 'Please input your presencePenalty!' }]}
                    >
                        <Input />
                    </Form.Item>


                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" onClick={handleNewChat}>
                            new chat
                        </Button>
                    </Form.Item>
                </Form> */}
            </div>
            <div className='right' >
                <div className="inputMsg" >
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            placeholder="请选择问题类型"
                            style={{ width: 220 }}
                            onChange={handleChange}
                            options={[
                                { value: '1', label: '文档下载类', msg: '请输入您要下载的文档对应的设备和文档的类型。回复需要时间，请耐心等待', },
                                { value: '2', label: '故障代码问询类', msg: '请输入设备类型和错误代码并以冒号连接！如:S7-200 Smart:0086。回复需要时间，请耐心等待' },
                                { value: '3', label: '问题回答类', msg: '请输入您的问题,回复需要时间，请耐心等待。' },
                            ]}
                        />
                        <Input placeholder="请输入您的问题" onChange={iptChange} value={currentMessage} />
                        <Button disabled={!flag} type="primary" onClick={addMessage} >提交</Button>
                    </Space.Compact>

                </div>
                {/* <Markdown>{markdown}</Markdown> */}

                <div className="items" ref={chatListRef}>
                    {
                        items.map((item: { type: number, value: string }, index: number) => {
                            return <div className="item" style={{ background: item.type ? '' : 'rgb(247, 247, 248)' }} key={index}>
                                <div className="solvemeg">
                                    {item.type ? avatar : avatarAi}
                                    <span>
                                        {item.value === '-1' ? <LoadingOutlined /> : !item.type ? (
                                            item.value && <Markdown rehypePlugins={[rehypeRaw,
                                                rehypeReact]} components={renderers as Partial<Components>}>{item.value}</Markdown>
                                        ) : item.value}
                                    </span>
                                </div>
                                <div className="dianzhan">
                                    <div className="top">
                                        {item.type ? '' : '您的评价对我们非常重要！'}
                                    </div>
                                    <div className="bot">
                                        {item.type ? '' :
                                            <Button onClick={() => setEvaluateHandler('up', index)} icon={<img style={{ width: 10 }} src='src/assets/thumbs-up.svg' />} >满意</Button>}
                                        {item.type ? '' :
                                            <Button onClick={() => setEvaluateHandler('down', index)} icon={<img style={{ width: 10 }} src='src/assets/thumbs-down.svg' />} >不满意</Button>}
                                    </div>


                                </div>
                            </div>
                        })
                    }
                </div>
                <FloatButton.BackTop visibilityHeight={0} onClick={() => (chatListRef.current as any).scrollTop = 0} />
            </div>
        </div >
    )
}

export default Home