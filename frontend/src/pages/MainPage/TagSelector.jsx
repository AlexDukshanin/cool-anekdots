import React, { useState, useRef, useEffect } from "react";
import tagOptions from "./TagOptions";

function TagSelector({ tag, setTag, user, sortOrder, setSortOrder }) {
  const [ openDropdown, setOpenDropdown ] = useState(null)
  const dropdownRef = useRef(null)
  

  /**
   * функция закрывает окно при клике вне области меню
   */
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  /**
   * Если в массиве тегов эллемент есть то его удаляем, если нет - добавляем
   * @param {*} value 
   */
  const toggleTag = (value) => {
    if (value === "on_moderated") {
      setTag([value]) 
      return;
    }
    if (tag.includes("on_moderated")) {
      setTag([value])
      return
    }
    if (tag.includes(value)) {
      setTag(tag.filter((t) => t !== value)); 
    } else {
      setTag([...tag, value]); 
    }
  }
  /**
   * Если окно закрыто - открываем
   * если открыто закрываем
   * если открыто но мы кликаем на второе окно, закрываем первое и октрываем второй
   * @param {Название группы тегов } dropdownValue 
   */
  const toggleDropdown = (dropdownValue) => {
    setOpenDropdown(openDropdown === dropdownValue ? null : dropdownValue);
  };
  /**
   * Если передается названеи тега - он подвечивается выбранным
   * @param {Название тега} optionValue 
   * @returns 
   */
  const isOptionSelected = (optionValue) => {
    return tag.includes(optionValue);
  };


  const hasSelectedOptions = (dropdown) => {
    if (!dropdown.options) return false;
    return dropdown.options.some(option => tag.includes(option.value));
  };

    return(
    <div className="main-tag-selector" ref={dropdownRef}>
      <div className="main-tag-option">
        <button
        className={tag.length === 0 ? "tag-button-selected" : "tag-button"}
        onClick={() => {
          setTag([]);
        }}
      >
        Показать все
      </button>
      </div>
      {tagOptions.map((dropdown,index) => (
        <div
        key={dropdown.value}
        className={`main-tag-option ${isOptionSelected(dropdown.value) ? 'main-tag-selected' : ''}`}>
          <button
           className={`main-tag-value ${openDropdown === dropdown.value ? 'active' : ''} ${hasSelectedOptions(dropdown) ? 'has-selected' : ''}`}
          onClick={() => toggleDropdown(dropdown.value)}>
            {dropdown.label} ▼
          </button>
          {openDropdown === dropdown.value && dropdown.options &&(
            <div className="main-dropdown-menu">
              {dropdown.options.map((option) => (
                <button
                key={option.value}
                className={`main-dropdown-item ${isOptionSelected(option.value) ? 'selected' : ''}`}
                onClick={() => toggleTag(option.value) }>
                  {option.label}
                  {isOptionSelected(option.value)}
                </button>
              ))}
            </div>
          )}
          
        </div>
      ))}
      <div className="main-tag-option">
        <button
          className={`main-tag-value ${openDropdown === "rating" ? 'active' : ''}`}
          onClick={() => toggleDropdown("rating")}
        >
          По рейтингу ▼
        </button>

        {openDropdown === "rating" && (
          <div className="main-dropdown-menu">
            <button
              className={`main-dropdown-item ${sortOrder === "best" ? 'selected' : ''}`}
              onClick={() => { setSortOrder("best"); setOpenDropdown(null); }}
            >
              Сначала лучшие
            </button>
            <button
              className={`main-dropdown-item ${sortOrder === "worst" ? 'selected' : ''}`}
              onClick={() => { setSortOrder("worst"); setOpenDropdown(null); }}
            >
              Сначала худшие
            </button>
            <button
              className={`main-dropdown-item ${sortOrder === null ? 'selected' : ''}`}
              onClick={() => { setSortOrder(null); setOpenDropdown(null); }}
            >
              Без сортировки
            </button>
          </div>
        )}
      </div>
      {user?.is_staff && (
      <div className="main-tag-option">
        <button 
          className={`${tag.includes("on_moderated") ? 'tag-button-selected' : "tag-button"}`}
          onClick={() => setTag(["on_moderated"])}
        >
          На модерации
        </button>
      </div>  
    )}
    </div>
  );
}

export default TagSelector;
