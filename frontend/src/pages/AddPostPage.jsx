import { useState, useEffect  } from "react";
import "../css/AddPostPage.css"
import { useAuth} from '../hooks/useAuth';
import { Link } from "react-router-dom";
import '../css/AddPostPage.css'


function AddPostPage() {
    const [ title, setTitle ] = useState('')
    const [ content, setContent ] = useState('')
    const { isAuth } = useAuth();
    const [error, setError] = useState()
    const [ success, setSuccess ] = useState()
    const [ agreed, setAgreed ] = useState(false)
    const [showRules, setShowRules] = useState(false)
    
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
            setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
        }, [error]);

        useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
            setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
        }, [success]);

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!isAuth) {
            setError('Необходимо авторизоваться, что бы добавить пост')
            return
        }
        if (!agreed) {
            setError('Что бы продолжить ознакомтесь и согласитесь с правилами публикации постов')
            return
        }
        if (!title.trim() || !content.trim()) {
            setError('Оба поля должны быть заполнены')
            return
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/posts/',{
                method: "POST",
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`
                },
                body: JSON.stringify({ 
                    title, 
                    content,
                    tags: 'on_moderation'  })
                })
            if (response.ok) {
                setSuccess('Пост успешно добавлен!');
                setTitle('');
                setContent('');
                setAgreed(false);
            } else {
                const data = await response.json();
                setError(data.message || 'Ошибка при добавлении поста')
                console.log(data);
            }   
        } catch (e){
            setError('Ошибка сети')
        }
    }

    const hideRules = () => {
        setShowRules(!showRules)
    }

    const acceptRules = () => {
        setAgreed(!agreed)
    }

    if (!isAuth) {
        return (
            <main>
                <div className="add-post">
                    <h1>Предложить пост</h1>
                        <h4>Предложить пост могут только авторизованные пользователи.</h4>
                        <div className="add-post-button-container">
                            <button className="add-post-button-container-button"><Link to='/login'>Войти</Link></button>
                            <button className="add-post-button-container-button"><Link to='/register'>Зарегистрироваться</Link></button>
                        </div>
                </div>
            </main>
        )
    }

    if (showRules) {
        return (
            <main>
                <div className="add-post">
                    <h1 style={{ marginBottom: '20px' }}>Правила публикации постов:</h1>
                    <div className="add-post-rules-container">
                        <ul>
                            <li>После отправки поста на публикацию пост получить статус "на модерации" и будет опубликован как только пройдет проверку модератора.</li>
                            <li>Модератор в праве изменить название или содержание поста в первую очередь во избежании синтаксических ошибок, если эти не обязательны для передачи сути анекдота.</li>
                            <li>Модератор так же выставит теги к посту по которым пост можно будет найти, теги выставляются исходя из содержания поста, а не его названия.</li>
                            <li>Пока пост находится на модерации он отображается в профиле пользователя, где его можно изменить до тех пор, пока пост не будет опубликован. Если же пост изменяется уже после его публикации, пост отправляется на повторную проверку к модератору</li>
                            <li>Пост может быть отклонен модератором если содержимое поста не соотвествует тематике нашего соощества, содержит прямые оскоробления реально существующих лиц,религий, существ, стран, политических партий и т.д Пост так же может быть отклонен модератором если опубликован идентичный, или максимально схожий пост на нашем сайте.</li>
                            <li>Любые анекдоты которые имеют схожие сет-ап но изменнынй панчлайн, иначе говоря изменненую концовку проходят модерацию с тегом переделки</li>
                            <li>Модерация сайта никак не влияет на оценку постов, оценка поста складываетс из общего количества оценок от пользователей поста на сайте</li>
                            <li>Все публикации на нашем сайте не несут цель оскоробить кого бы то ни было,наше сообщество несёт только одну цель, развесилить вас и всех тем с кем вы захотите поделится нашими анекдотами:)</li>
                        </ul>
                    </div>
                    <button onClick={hideRules} className="add-post-button">начитался</button>
                </div>
            </main>
        )
    }

    return (
        <main>
            <div className="add-post">
                <h3>Предложить анекдот</h3>
                    <div className="add-post-content">
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="title">Название анекдота
                            <input 
                                className="add-post-input-field" 
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)} />
                            </label>
                            <label htmlFor="text">Текст
                            <textarea
                                className="add-post-text-field"
                                id="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                />
                            </label>
                            <div className="checkbox-wrapper-62">
                            <input onChange={acceptRules} type="checkbox" className="check" id="check1-62"/>
                            <label htmlFor="check1-62" className="label">
                                <svg width="30" height="30" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
                                <rect x="30" y="20" width="50" height="50" stroke="black" fill="none" />
                                <g>
                                    <path d="m 13,43 c 33,6 40,26 55,48 " stroke="white" strokeWidth="3" className="path1" fill="none" />
                                    <path d="M 75,30 C 51,41 34,74 25,91 " stroke="white" strokeWidth="3" className="path1" fill="none" />
                                </g>
                                </svg>
                                С <strong onClick={hideRules}>правилами публикации</strong> ознакомлен
                            </label>
                            </div>
                            {error && <p className="add-post-error-message">{error}<button 
                                className="add-post-close-btn" 
                                onClick={() => setError('')}
                                aria-label="Закрыть сообщение об ошибке"
                                >×</button></p>}
                            {success && <p className="add-post-success-message">{success}<button 
                                className="add-post-close-btn" 
                                onClick={() => setSuccess('')}
                                aria-label="Закрыть сообщение об успехе"
                                >×</button></p>}
                            <button type="submit" className="add-post-button">Предложить</button>
                        </form>
                </div>
            </div>
        </main>
    )
}

export default AddPostPage

