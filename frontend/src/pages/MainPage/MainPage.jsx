import React, { useEffect, useState, useMemo } from "react";
import useAuthFetch from '../../hooks/token'
import '../../css/MainPage.css'

function MainPage() {
    const [posts, setPosts] = useState([])
    const [user,setUser] = useState(null)
    const authFetch = useAuthFetch()
    const [tag, setTag] = useState('default')


    const [editingName, setEditingName] = useState("")
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [editingTags, setEditingTags] = useState([])


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
                    data.forEach(el => {
                      console.log(el.tags)
                    });
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
        if (editingTags.includes(tag)) {
            setEditingTags(editingTags.filter( t => t !== tag))
        } else {
            setEditingTags([...editingTags, tag])
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
            body: JSON.stringify({ 
              content: editingContent,
              tags: editingTags}),
        });

        if (response.ok) {
            const updatedPost = await response.json();
            setPosts(posts.map(p => p.id === id ? updatedPost : p));
            setEditingPostId(null);
            setEditingTags([]);
        }
        } catch (error) {
        console.error("Ошибка при сохранении поста", error);
        }
    };

  return (
    <main className="main-section">
      <div className="main-container">
        <span className="main-container-tags">
          <button onClick={() => setTag("default")}>Все</button>
          <button onClick={() => setTag("animals")}>Про животных</button>
          <button onClick={() => setTag("new")}>Новое</button>
          <button onClick={() => setTag("worst")}>Не лучший</button>
          <button onClick={() => setTag("best")}>Лучшие</button>
          {user?.is_staff && (
            <button onClick={() => setTag("on_moderated")}>Посты на модерации</button>
          )}
        </span>

        <section> 
          {filteredPosts.map((post) => (
            <div className="main-section- container" key={post.id}>
              <h2 className="main-container-card-name">{post.title}</h2>

              {editingPostId === post.id ? (
                <div className="edit-form">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <p>Теги поста:</p> 
                  <div className="tag-buttons">
                    {['animals', 'new', 'best', 'worst', 'old','on_moderated','funny'].map(tag => (
                        <button
                        key={tag}
                        type="button"
                        onClick={() => addTags(tag)}
                        className={editingTags.includes(tag) ? "tag-button-selected" : "tag-button"}
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
                      setEditingName(post.name)
                      setEditingContent(post.content);
                      setEditingTags(post.tags || [])
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