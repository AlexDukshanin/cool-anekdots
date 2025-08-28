import React, { useEffect, useState, useMemo } from "react";
import useAuthFetch from '../../hooks/token'


function MainPage() {
    const [posts, setPosts] = useState([])
    const [user,setUser] = useState(null)
    const authFetch = useAuthFetch()
    const [tag, setTag] = useState('default')
    const [ moderate, setModerate ] = useState(false)
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [ tags, setTags] = useState([])


    useEffect(() => {
        const getPosts = async () => {
            try {
                let response = await fetch("http://127.0.0.1:8000/api/posts/", {
                    method: 'GET',
                    headers: { "Content-Type": "application/json" }
                })

                if (tag == "on_moderated") {
                    response = await authFetch("http://127.0.0.1:8000/api/posts/on_moderated/", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    })
                }
          
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error("Ошибка при загрузке постов", error);
            }
        }; 
        getPosts();
    }, [tag, authFetch])

   

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authFetch("http://127.0.0.1:8000/api/auth/profile/");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке пользователя", error);
      }
    };

    fetchUser();
  }, [authFetch]);


    const filteredPosts = useMemo(() => {
    if (tag === "default" || tag === "on_moderated") {
        // данные уже пришли от бэка готовыми
        return posts;
    }

    return posts.filter((post) => {
        if (tag === "animals") return post.tags === "animals";
        if (tag === "new") return post.is_new === true;
        if (tag === "best") return post.rating >= 4;
        if (tag === "worst") return post.rating <= 2;
        if (tag === "old") return post.is_old === true;
        return true;
    });
    }, [posts, tag]);

    const addTags = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter( t => t !== tag))
        } else {
            setTags([...tags, tag])
        }
    }

    /**
     * Функция для редактирования поста, берет пост по айд, и патчит туда новый текст
     * @param {*} id 
     */
    const handleSave = async (id) => {
        try {
        const response = await authFetch(`http://127.0.0.1:8000/api/posts/${id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editingContent }),
        });

        if (response.ok) {
            const updatedPost = await response.json();
            setPosts(posts.map(p => p.id === id ? updatedPost : p));
            setEditingPostId(null);
        }
        } catch (error) {
        console.error("Ошибка при сохранении поста", error);
        }
    };

  return (
    <main>
      <div className="main-container">
        <span className="main-container-tags">
          <button onClick={() => setTag("default")}>Все</button>
          <button onClick={() => setTag("animals")}>Про животных</button>
          <button onClick={() => setTag("new")}>Новое</button>
          <button onClick={() => setTag("worst")}>Не лучший</button>
          <button onClick={() => setTag("best")}>Лучшие</button>
          <button onClick={() => setTag("old")}>Старое</button>
          {user?.is_staff && (
            <button onClick={() => setTag("on_moderated")}>Посты на модерации</button>
          )}
        </span>

        <section>
          {filteredPosts.map((post) => (
            <div className="main-container-card" key={post.id}>
              <h2 className="main-container-card-name">{post.title}</h2>

              {editingPostId === post.id ? (
                <div className="edit-form">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="tag-buttons">
                    {['animals', 'new', 'best', 'worst', 'old'].map(tag => (
                        <button
                        key={tag}
                        type="button"
                        onClick={() => addTags(tag)}
                        className={tags.includes(tag) ? "selected" : ""}
                        >
                        {tag}
                        </button>
                    ))}
                    </div>
                  <button onClick={() => handleSave(post.id)}>Сохранить</button>
                  <button onClick={() => setEditingPostId(null)}>Отмена</button>
                </div>
              ) : (
                <>
                  <p className="main-container-card-text">{post.content}</p>
                  {user?.is_staff && (
                    <button onClick={() => {
                      setEditingPostId(post.id);
                      setEditingContent(post.content);
                    }}>
                      Редактировать
                    </button>
                  )}
                </>
              )}

              <span className="main-container-card-datetime">{post.created_at}</span>
              <span className="main-container-card-author">{post.author_name}</span>
              <span className="main-container-card-rating">
                {post.average_rating ?? post.rating}
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default MainPage;