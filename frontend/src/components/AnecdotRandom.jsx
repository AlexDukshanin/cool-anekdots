import React, {useEffect, useState, useRef }from "react";
import axios from 'axios'
import { useAuth } from '../hooks/useAuth';
import Card3DAnimation from "./AnecdotAnimation";

const AnecdotRandom = ({ isAuthenticated  }) =>{
    const[post, setPost] = useState(null)
    const { isAuth } = useAuth();
    const cardRef = useRef(null);

    const fetchRandomPost = () => {
        axios.get('http://127.0.0.1:8000/api/posts/random/')
        .then(res => setPost(res.data))
        .catch(err => console.error('Ошибка при загрузке поста',err))
    }

    //Это вывод постов короче
    const ratePost = (score) => {
        if (!post) return;

        axios.post('http://127.0.0.1:8000/api/ratings/', {
          post: post.id,
          score: score
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`  // если используешь JWT
          }
        })
          .then(res => {
            alert('Оценка отправлена!');
            setPost(el => ({
              ...el,
              average_rating: res.data.average_rating
            }))
          })
          .catch(err => console.error('Ошибка при оценке:', err));
      };

      //добавление отступов перед дефизом 
      const formatContent = (text) => {
        if (!text) return ""
        return text.replace(/-/g, function(word){
          switch(word){
            case '-':return('</br>-')
          }
        })
      }

      useEffect(() => {
        fetchRandomPost();
      }, []);
      
    
      //доделать загрузку!!!!
      if (!post) return <p className="loading">Загрузка...</p>;

      return (
        <Card3DAnimation>
          <div className="random_anecdot_card">
              <h2 className="random_anecdot_name">{post.title}</h2>
              <div className="random_anecdot_div">
               <p 
                    className="random_anecdot_text" 
                    dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} 
                />
              </div>
              <p className="random_anecdot_rating"><strong>Средняя оценка:</strong> {post.average_rating}</p>
            {isAuth && (
              <div>
                <p>Оцени анекдот:</p>
                {[1, 2, 3, 4, 5].map(score => (
                  <button className="random_anecdot_button" key={score} onClick={() => ratePost(score)}>{score}</button>
                ))}
              </div>
            )}
            <button className="random_anecdot_button" onClick={fetchRandomPost}>Другой анекдот</button>
            <p className="random_anecdot_rating" >Автор: {post.author_name}</p>
            {/* После отправки оценки имя автора пропадает */}
          </div>
        </Card3DAnimation>
      );
}

export default AnecdotRandom
