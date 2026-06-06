import React, { useEffect, useState, useMemo } from "react";
import useAuthFetch from '../../hooks/token'
import RatingPost from "./RatingPost";
import '../../css/MainPage.css'
import TagSelector from "./TagSelector";
import tagOptions from "./TagOptions";
import Pagination from "./Pagination";

function MainPage() {
  /* сюда помещаем посты*/
    const [posts, setPosts] = useState([])
    /* сюда данные о пользователе*/
    const [user,setUser] = useState(null)
    const authFetch = useAuthFetch()
    /* сюда список тегов который будем передавать на сервер при редактировании*/
    const [tag, setTag] = useState([])
    /* сюда помещаем теги выбранные для сортировки*/
    const [sortOrder, setSortOrder] = useState(null)
    /* сюда передаем данные о том, на какой странице нахоидтся пользователь, для того что бы заетм удобно перемещаться по страницам*/
    const [ page, setPage] = useState(1)
    /* сюда данные о том сколько постов показывать на странице*/
    const [ pageSize, setPageSize] = useState(10)
    /* переменная которая хранит данные открто ли окно поиска тегов для поста или нет*/
    const [ isTagSearchOpen, setTagSearchOpen ] = useState(false)
    // поле которое содержит строку, которую вводит модератор для поиска постов 
    const [ searchQuery, setSearchQuery ] = useState("")
    const [postSearchQuery, setPostSearchQuery] = useState("")

    const [editingName, setEditingName] = useState("")
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [editingTags, setEditingTags] = useState([])
    /**
     * Берет весь массив TagOption, выделяет из него все опции, их мы передаем в теги которые админ моежт проставить посту
     */
    const allOptions = [
      ...tagOptions.flatMap(el => el.options || []),
      { value: "on_moderated", label: "На модерации" }
    ];
    // переменная которая содержит теги отфильрованные переменной выше, те есть теги которые получилось найти по введенной строке
    const [ filteredTags, setFilteredTags] = useState(allOptions)
    
    /**
   * Функция для сортировки постов по тегам
   * если массив с тегами пустой выводит все посты, если есть на модерации - те что на модерации
   */
  const filteredPosts = useMemo(() => {
    let result
    if (tag.length === 0 || tag.includes("on_moderated")) {
      result = posts
    } else { 
      result = posts.filter((post) => {
      if (!Array.isArray(post.tags)) return false;
      return tag.every((t) => post.tags.includes(t));
      });
    }

    const normalizedSearch = postSearchQuery.trim().toLowerCase()
    if (normalizedSearch) {
      result = result.filter((post) => {
        const searchable = [
          post.title,
          post.content,
          post.author_name,
          ...(Array.isArray(post.tags) ? post.tags : []),
        ].join(" ").toLowerCase()

        return searchable.includes(normalizedSearch)
      })
    }

    if (sortOrder === "best") {
      result = [...result].sort((a,b) => b.average_rating - a.average_rating)
    } else if ( sortOrder === "worst") {
      result = [...result].sort((a,b) => a.average_rating - b.average_rating )
    }
    return result
    }, [posts, tag, sortOrder, postSearchQuery]);

    useEffect(() => {
      setPage(1)
    }, [tag, sortOrder, postSearchQuery, pageSize])

    const paginationPosts = useMemo(() => {
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return filteredPosts.slice(start, end)
    }, [filteredPosts, page, pageSize])

    useEffect(() => {
    const getPosts = async () => {
      try {
        let response;

        if (tag.includes("on_moderated")) {
          response = await authFetch("/api/posts/on_moderated/", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        } else {
          response = await fetch("/api/posts/", {
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
      const response = await authFetch("/api/auth/profile/");
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
        const response = await authFetch(`/api/posts/${id}/`, {
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
            setTagSearchOpen(false);
        }
        } catch (error) {
        console.error("Ошибка при сохранении поста", error);
        }
    };

    const handlePublish = async (id) => {
      try {
        const response = await authFetch(`/api/posts/${id}/publish/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const publishedPost = await response.json();
          if (tag.includes("on_moderated")) {
            setPosts(posts.filter((post) => post.id !== id));
          } else {
            setPosts(posts.map((post) => post.id === id ? publishedPost : post));
          }
        }
      } catch (error) {
        console.error("Ошибка при публикации поста", error);
      }
    }

    const handleSearchChange = (e) => {
      const query = e.target.value
      setSearchQuery(query)

      setFilteredTags(
        allOptions.filter((tag) =>
          tag.label.toLowerCase().includes(query.toLowerCase())
        )
      )
    }

    const TextSpace = (text) => {
    if (!text) return null;
    const hasLeadingDash = /^\s*-/.test(text);
    const parts = text.split(/\s*-\s*/).map(p => p.trim()).filter(Boolean);

    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {i > 0 && <><br /> -{part}</>}
        {i === 0 && (hasLeadingDash ? `-${part}` : part)}
      </React.Fragment>
    ));
  };


  return (
    <main className="main-section">
      <div className="main-container">
        <TagSelector 
        tag={tag}
        setTag={setTag}
        user={user}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}/>
        <div className="tag-input-tag-search main-post-search">
          <input
            type="text"
            placeholder="Поиск по названию, тексту, автору или тегу"
            value={postSearchQuery}
            onChange={(e) => setPostSearchQuery(e.target.value)}
          />
        </div>
        <section> 
          {paginationPosts.map((post) => (
            <div className="main-section-container" key={post.id}>
              <h2 className="main-container-card-name">{post.title}</h2>
              {editingPostId === post.id ? (
                <div className="edit-form">
                  <label htmlFor="input">Редактировать название</label>
                  <input type="text"
                  className="edit-form-input" 
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)} />
                  <label htmlFor="textarea">Редактировтаь текст</label>
                  <textarea
                    className="edit-form-textarea"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  
                  <p>Теги поста</p>
                  <div className="main-tag-buttons">
                    <div className="main-tag-dropdawn">
                    {editingTags.length === 0 ? (
                      <div className="main-tag-buttons-NoTags">
                        У поста отсутсвуют теги
                      </div>
                    ) : ( allOptions.map(({ value, label}) => {
                      if (editingTags.includes(value)) {
                        return(
                          <button 
                          key={value}
                          className="tag-button-selected"
                          onClick={() => addTags(value)}
                          type="button"
                          >
                            {label}
                          </button>
                        )
                      }
                    })
                    )}
                    </div>
                  </div>
                  <div className="tag-input-tag-search">
                    <label 
                    htmlFor="input"
                    className=""
                    >Добавить теги:</label>
                    <input 
                    type="text"
                    placeholder="поиск тегов"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={() => setTagSearchOpen(true)} />
                  </div>
                  {isTagSearchOpen && (
                    <div className="main-tag-dropdawn">
                    {filteredTags.map(({ value, label}) => {
                      if(!editingTags.includes(value)) {
                        return(
                          <button
                          key={value}
                          type="button"
                          className="tag-button"
                          onClick={() => addTags(value)}
                        >
                          {label}
                        </button>
                        )
                      }
                    })}
                    </div>
                  )}
                  <div className="main-section-button-group">
                  <button 
                    onClick={() => handleSave(post.id)}
                    className="main-save-button">
                      Сохранить
                      </button>
                  <button 
                    onClick={() => {
                      setEditingPostId(null)
                      setTagSearchOpen(false)
                    }}
                    className="main-reject-button"
                    >
                    Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="main-container-card-text">{TextSpace(post.content)}</p>
                  {user?.is_staff && (
                    <div className="main-section-button-group">
                      <button onClick={() => {
                        setEditingPostId(post.id);
                        setEditingName(post.title)
                        setEditingContent(post.content);
                        setEditingTags(post.tags || [])
                      }}
                      className={`main-edit-button`}>
                        Редактировать
                      </button>
                      {post.tags?.includes("on_moderated") && (
                        <button
                          onClick={() => handlePublish(post.id)}
                          className="main-save-button"
                        >
                          Опубликовать
                        </button>
                      )}
                    </div>
                  )}
                  <RatingPost
                  post={post}
                  setPosts={setPosts} />
                </>
              )}
              <div className="main-container-card-info">
                <span className="main-container-card-datetime">Опубликовано: {new Date(post.created_at).toLocaleDateString("ru-RU")}</span>
                <span >Автор: <span className="main-container-card-author">{post.author_name}</span></span>
                <span className="main-container-card-rating">
                  Рейтинг: {post.average_rating ?? post.rating}
                </span>
              </div>
              
            </div>
          ))}
          
        </section>
        <Pagination
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        total={filteredPosts.length} />
      </div>
    </main>
  );
}

export default MainPage;
