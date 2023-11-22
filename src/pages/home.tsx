// 导入userStroe
import { LoadingOutlined, RedditOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Input, message, Space, Avatar, Select, } from 'antd'
import { SetStateAction, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setEvaluate, setMessage } from '../server'
import Markdown from 'react-markdown'
import { v4 as uuidv4 } from 'uuid';

const Home: React.FC = () => {
    const navigate = useNavigate()
    const userName = localStorage.getItem('userName')
    const [currentMessage, setcurrentMessage] = useState('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<{ type: number, value: string | any }[]>([])
    const [messageType, setmessageType] = useState('')
    //判断当前是满意还是不满意的回执
    const [flag, setflag] = useState<boolean>(false)
    const iptChange = (value: { target: { value: SetStateAction<string> } }) => {
        setcurrentMessage(value.target.value)
    }

    // 用于操作聊天列表元素的引用
    const chatListRef = useRef(null)

    // 声明一个包含Markdown格式字符串的变量
    const markdown = `
### 123   
## 123  
- 123  
- 456
`

    const addMessage = async () => {
        if (messageType !== '' && currentMessage.trim() !== '') {
            setItems([...items, { type: 1, value: currentMessage }, { type: 0, value: '-1' }])
            const res = await setMessage({
                type: messageType,
                value: currentMessage,
            })
            if (res.data.code === 200) {
                setTimeout(() => {
                    setcurrentMessage('')
                    setItems((old) => {
                        console.log('old', old);
                        const oldmew = old.slice(0, old.length - 1)
                        const newValue = [...oldmew, { type: 0, value: markdown }]
                        return newValue
                    })
                }, 1000)
            }
        }
    }


    const handleChange = (value: string, option: { value: string, label: string, msg: string }) => {
        setItems([{ type: 0, value: option.msg }])
        setmessageType(value)
    };
    useEffect(() => {
        if (userName === null) {
            navigate('/login')
            message.error('登录信息过期，请重新登录！');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    const setEvaluateHandler = async (behavior: string, index: number) => {
        const res = await setEvaluate({
            chatId: uuidv4(),
            type: behavior,
            problemList: items.slice(1, index + 1),
        })
        if (res.data.code === 200) {
            message.success('反馈成功！');
        }

    };
    useEffect(() => {
        const current: { scrollTop: unknown, scrollHeight: unknown } = chatListRef.current!
        //scrollHeight是页面的高度
        current.scrollTop = current.scrollHeight
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

    const avatar = <Avatar style={{ backgroundColor: '#0070c0', }} icon={<UserOutlined />} />
    const avatarAi = <Avatar style={{ backgroundColor: '#19c37d', }} icon={<RedditOutlined />} />


    return (
        <div className="home">
            <div className='left'>2 / 5</div>
            <div className='right' ref={chatListRef}>
                <div className="inputMsg" >
                    <Space.Compact style={{ width: '100%' }}>
                        <Select
                            placeholder="请选择问题类型"
                            style={{ width: 220 }}
                            onChange={handleChange}
                            options={[
                                { value: '1', label: '文档下载类', msg: '请输入您要下载的文档', },
                                { value: '2', label: '故障代码问询类', msg: '请输入设备类型和错误代码并以冒号连接！如:西门子s7-200 Smart:0086' },
                                { value: '3', label: '问题回答类', msg: '请输入您的问题' },
                            ]}
                        />
                        <Input placeholder="请输入您的问题" onChange={iptChange} value={currentMessage} />
                        <Button disabled={!flag} type="primary" onClick={addMessage} >Submit</Button>
                    </Space.Compact>

                </div>
                {/* <Markdown>{markdown}</Markdown> */}

                <div className="items">
                    {
                        items.map((item: { type: number, value: string }, index: number) => {
                            return <div className="item" style={{ background: item.type ? '' : 'rgb(247, 247, 248)' }} key={index}>
                                <div className="solvemeg">
                                    {item.type ? avatar : avatarAi} <span>{item.value === '-1' ? <LoadingOutlined /> : !item.type ? <Markdown>{item.value}</Markdown> : item.value}</span>
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
            </div>
        </div >
    )
}

export default Home