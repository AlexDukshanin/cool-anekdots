import React, { useEffect, useState, useMemo } from "react";
import useAuthFetch from '../../hooks/token'
import '../../css/MainPage.css'
import TagSelector from "./TagSelector";

function MainPage() {
    const [posts, setPosts] = useState([])
    const [user,setUser] = useState(null)
    const authFetch = useAuthFetch()
    const [tag, setTag] = useState([])

    const [editingName, setEditingName] = useState("")
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [editingTags, setEditingTags] = useState([])
  
    const tagOptions = [
      { value: "PostMetaIrony", label: "Мета-Ирония" },
      { value: "Classik", label: "Классика"},
      { value: "VasilyIvanych", label: "Про Василия Иваныча" },
      { value: "Porychick", label: "Про поручика" },
      { value: 'vovchik', label: "Вовочка"},
      { value: 'milord', label: "Царь"},
      { value: 'shtirlitz', label: "Штирлиц"},
      { value: "chukcha", label: "Чукча"},
      { value: 'soldiers', label: "Военные"},
      { value: 'medic', label: "Врачи"},
      { value: 'stydents', label: "Школьники"},
      { value: 'cowboy', label: "Ковбои"},
      { value: 'priests', label: "Батюшки"},
      { value: "alkoghol", label: "Алкоголики" },
      { value: "animals", label: "Про животных" },
      { value: 'school', label: "Школа"},
      { value: 'WieldWest', label: "Дикий Запад"},
      { value: 'bar', label: "Заходит как то в бар..."},
      { value: "island", label: "Необитаемый остров" },
      { value: "army", label: "Армия"},
      { value: "on_moderated", label: "на модерации"}
  ];

    useEffect(() => {
    const getPosts = async () => {
      try {
        let response;

        if (tag.includes("on_moderated")) {
          response = await authFetch("http://127.0.0.1:8000/api/posts/on_moderated/", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        } else {
          response = await fetch("http://127.0.0.1:8000/api/posts/", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
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
  }, [tag, authFetch]);

   
  /**
   * Получает данные о пользователе, важно что бы проверить пользователь is_staff или нет
   */
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

  /**
   * Функция для сортировки постов по тегам
   * если массив с тегами пустой выводит все посты, если есть на модерации - те что на модерации
   */
  const filteredPosts = useMemo(() => {
    if (tag.length === 0 || tag.includes("on_moderated")) {
      return posts;
    }

    return posts.filter((post) => {
        if (!Array.isArray(post.tags)) return false;
        return tag.every((t) => post.tags.includes(t));
      });
    }, [posts, tag]);


  /**
   * Функция которая позволяет добавлять теги в массив тегов, который потом будет отправляться на сервер
   * @param {сюда передается названеи тега } tag 
   */
  const addTags = (tag) => {
      if (editingTags.includes(tag)) {
          setEditingTags(editingTags.filter( t => t !== tag))
      } else {
          setEditingTags([...editingTags, tag])
      }
  }

    /**
     * Функция для редактирования поста, берет пост по айд, и патчит туда новый текст
     * Так же берет массив тегов и заменяет им существующий массив тегов 
     * так же изменяет название поста 
     * @param {*} id 
     */
    const handleSave = async (id) => {
        try {
        const response = await authFetch(`http://127.0.0.1:8000/api/posts/${id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              title: editingName,
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
        <TagSelector 
        tag={tag}
        setTag={setTag}
        user={user}/>
        <section> 
          {filteredPosts.map((post) => (
            <div className="main-section-container" key={post.id}>
              <h2 className="main-container-card-name">{post.title}</h2>

              {editingPostId === post.id ? (
                <div className="edit-form">
                  <input type="text" 
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)} />
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <p>Теги поста:</p> 
                  <div className="tag-buttons">
                    {tagOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => addTags(value)}
                        className={editingTags.includes(value) ? "tag-button-selected" : "tag-button"}
                      >
                        {label}
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
                      setEditingName(post.title)
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