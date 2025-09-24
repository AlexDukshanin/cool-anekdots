import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

function RatingPost({ posts, setPosts}) {
    const { isAuth } = useAuth() 
    const [ showRatings, setShowRatings] = useState(false)
    const [ loading, setLoading ] = useState(false)
    

    const toggleRatings  = () => setShowRatings(!showRatings)

    const ratePost = (score) => {
        if (!posts) return;
        setLoading(true)
        const res = axios.post('http://127.0.0.1:8000/api/ratings/', {
          post: posts.id,
          score: score
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`  
          }
        })
        setPosts((prev) => ({
            ...prev,
            average_rating: res.data.average_rating
        }))

        alert(`Ваша оценка отправлена, какое же уебищное меню господи пофиксите меня `)
        toggleRatings()
        setLoading(false)
          
      };


    if (!isAuth) return null
    return (
    <div>
      {!showRatings ? (
        <button className="main-edit-button" onClick={toggleRatings}>
          Оценить
        </button>
      ) : (
        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              disabled={loading}
              onClick={() => ratePost(score)}
              className="main-edit-button"
            >
              {score} ⭐
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RatingPost