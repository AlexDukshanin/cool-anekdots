import React from "react";

const tagOptions = [
{ label: "Стиль",
value: "style", 
options: [
    { value: "PostMetaIrony", label: "Мета-Ирония" },
    { value: "Classik", label: "Классика"},
    { value: "VeryOld", label: "Бородатые"},
    { value: "peredelky", label: "Переделки"}
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
    { value: "mother", label: "Мама"},
    { value: "father", label: "Батя"},
    { value: "mother-in-low", label: "Теща"},
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
]},
{  value: "location",
    label: "Место действия", 
    options:[
    { value: 'school', label: "Школа"},
    { value: 'WieldWest', label: "Дикий Запад"},
    { value: 'bar', label: "Заходит как то в бар..."},
    { value: "island", label: "Необитаемый остров" },
    { value: "military", label: "Армия"}
]},
];

export default tagOptions;