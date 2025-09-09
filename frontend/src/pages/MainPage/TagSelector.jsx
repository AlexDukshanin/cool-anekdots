import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";

function TagSelector({ tag, setTag, user }) {
  const [ openDropdown, setOpenDropdown ] = useState(null)
  const dropdownRef = useRef([])


  const tagOptions = [
  { label: "Стиль",
    value: "style", 
    options: [
      { value: "PostMetaIrony", label: "Мета-Ирония" },
      { value: "Classik", label: "Классика"}
  ]},
  { value: "character", 
    label: "Персонажи", 
    options: [
      { value: "VasilyIvanych", label: "Про Василия Иваныча" },
      { value: "Porychick", label: "Про поручика" },
      { value: 'vovchik', label: "Вовочка"},
      { value: 'milord', label: "Царь"},
      { value: 'shtirlitz', label: "Штирлиц"},
      { value: "chukcha", label: "Чукча"},
  ]},
  { value: "content", 
    label: "По содержанию", 
    options:[
      { value: 'soldiers', label: "Военные"},
      { value: 'medic', label: "Врачи"},
      { value: 'stydents', label: "Школьники"},
      { value: 'cowboy', label: "Ковбои"},
      { value: 'priests', label: "Батюшки"},
      { value: "alkoghol", label: "Алкоголики" },
      { value: "animals", label: "Про животных" },
      { }
  ]},
  {  value: "location",
     label: "Место действия", 
     options:[
      { value: 'school', label: "Школе"},
      { value: 'WieldWest', label: "Дикий Запад"},
      { value: 'bar', label: "Заходит как то в бар..."},
      { value: "island", label: "Необитаемый остров" },
      { value: "army", label: "Армия"}
  ]},
  ];
  /**
   * функция закрывает окно при клике вне области меню
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
    const isOutside = dropdownRef.current.every(ref => 
      ref && !ref.contains(event.target)
    );
    if (isOutside) {
      setOpenDropdown(null)
    }
  }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside)
  },[])

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
    <div className="main-tag-selector">
      <button
        className={tag.length === 0 ? "tag-button-selected" : "tag-button"}
        onClick={() => {
          setTag([]);
        }}
      >
        Показать все
      </button>
      {tagOptions.map((dropdown,index) => (
        <div
        key={dropdown.value}
        className={`main-tag-option ${isOptionSelected(dropdown.value) ? 'main-tag-selected' : ''}`}
        ref={el => dropdownRef.current[index] = el}>
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

      

      {user?.is_staff && (
        <button
          className={tag.includes("on_moderated") ? "tag-button-selected" : "tag-button"}
          onClick={() => toggleTag("on_moderated")}
        >
          Посты на модерации
        </button>
      )}
    </div>
  );
}

export default TagSelector;