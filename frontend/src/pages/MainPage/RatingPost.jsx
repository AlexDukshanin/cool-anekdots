import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

function RatingPost({ post, setPosts}) {
    const { isAuth } = useAuth() 
    const [ showRatings, setShowRatings] = useState(false)
    const [ loading, setLoading ] = useState(false)
    

    const toggleRatings  = () => setShowRatings(!showRatings)

    const ratePost = async (score) => {
        if (!post) return;
        setLoading(true)
        try {
            const res = await axios.post('/api/ratings/', {
              post: post.id,
              score: score
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('access')}`
              }
            })
            setPosts((prev) => prev.map((item) => (
                item.id === post.id
                    ? { ...item, average_rating: res.data.average_rating }
                    : item
            )))

            alert('Оценка отправлена')
            toggleRatings()
        } catch (error) {
            console.error('Ошибка при оценке:', error)
        } finally {
            setLoading(false)
        }
          
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
