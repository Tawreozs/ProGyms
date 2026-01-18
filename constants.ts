
import { ExerciseDatabaseItem, ExerciseType } from './types';

export const EXERCISE_DATABASE: ExerciseDatabaseItem[] = [
  // Ноги
  { name: 'Приседания со штангой', type: ExerciseType.STRENGTH, category: 'Ноги' },
  { name: 'Жим ногами в тренажёре', type: ExerciseType.STRENGTH, category: 'Ноги' },
  { name: 'Выпады с гантелями / штангой', type: ExerciseType.STRENGTH, category: 'Ноги' },
  { name: 'Сгибание ног лёжа (бицепс бедра)', type: ExerciseType.STRENGTH, category: 'Ноги' },
  { name: 'Разгибание ног в тренажёре', type: ExerciseType.STRENGTH, category: 'Ноги' },
  // Ягодицы
  { name: 'Ягодичный мост / Hip Thrust', type: ExerciseType.STRENGTH, category: 'Ягодицы' },
  { name: 'Приседания (сумо)', type: ExerciseType.STRENGTH, category: 'Ягодицы' },
  { name: 'Выпады назад', type: ExerciseType.STRENGTH, category: 'Ягодицы' },
  { name: 'Отведения ноги в кроссовере', type: ExerciseType.STRENGTH, category: 'Ягодицы' },
  { name: 'Гиперэкстензия (ягодичный акцент)', type: ExerciseType.STRENGTH, category: 'Ягодицы' },
  // Спина
  { name: 'Подтягивания', type: ExerciseType.STRENGTH, category: 'Спина' },
  { name: 'Тяга верхнего блока', type: ExerciseType.STRENGTH, category: 'Спина' },
  { name: 'Тяга штанги в наклоне', type: ExerciseType.STRENGTH, category: 'Спина' },
  { name: 'Тяга горизонтального блока', type: ExerciseType.STRENGTH, category: 'Спина' },
  { name: 'Становая тяга', type: ExerciseType.STRENGTH, category: 'Спина' },
  { name: 'Тяга гантели одной рукой', type: ExerciseType.STRENGTH, category: 'Спина' },
  // Грудь
  { name: 'Жим штанги лёжа', type: ExerciseType.STRENGTH, category: 'Грудь' },
  { name: 'Жим гантелей лёжа', type: ExerciseType.STRENGTH, category: 'Грудь' },
  { name: 'Жим на наклонной скамье', type: ExerciseType.STRENGTH, category: 'Грудь' },
  { name: 'Сведения в тренажёре (Бабочка)', type: ExerciseType.STRENGTH, category: 'Грудь' },
  { name: 'Отжимания на брусьях (грудной акцент)', type: ExerciseType.STRENGTH, category: 'Грудь' },
  // Плечи
  { name: 'Жим штанги/гантелей вверх', type: ExerciseType.STRENGTH, category: 'Плечи' },
  { name: 'Разведения гантелей в стороны', type: ExerciseType.STRENGTH, category: 'Плечи' },
  { name: 'Разведения в наклоне (задняя дельта)', type: ExerciseType.STRENGTH, category: 'Плечи' },
  { name: 'Тяга штанги к подбородку', type: ExerciseType.STRENGTH, category: 'Плечи' },
  { name: 'Жим в тренажёре Смита', type: ExerciseType.STRENGTH, category: 'Плечи' },
  // Бицепс
  { name: 'Подъём штанги на бицепс', type: ExerciseType.STRENGTH, category: 'Бицепс' },
  { name: 'Подъём гантелей стоя', type: ExerciseType.STRENGTH, category: 'Бицепс' },
  { name: 'Молотковые сгибания', type: ExerciseType.STRENGTH, category: 'Бицепс' },
  { name: 'Подъём штанги EZ', type: ExerciseType.STRENGTH, category: 'Бицепс' },
  // Трицепс
  { name: 'Жим узким хватом', type: ExerciseType.STRENGTH, category: 'Трицепс' },
  { name: 'Разгибания рук на блоке', type: ExerciseType.STRENGTH, category: 'Трицепс' },
  { name: 'Французский жим', type: ExerciseType.STRENGTH, category: 'Трицепс' },
  { name: 'Разгибание из-за головы', type: ExerciseType.STRENGTH, category: 'Трицепс' },
  // Пресс
  { name: 'Скручивания на полу', type: ExerciseType.STRENGTH, category: 'Пресс' },
  { name: 'Подъёмы ног в висе', type: ExerciseType.STRENGTH, category: 'Пресс' },
  { name: 'Планка', type: ExerciseType.STRENGTH, category: 'Пресс' },
  // Икры
  { name: 'Подъёмы на носки стоя', type: ExerciseType.STRENGTH, category: 'Икры' },
  { name: 'Подъёмы на носки сидя', type: ExerciseType.STRENGTH, category: 'Икры' },
  // Растяжка
  { name: 'Растяжка спины', type: ExerciseType.STRENGTH, category: 'Растяжка' },
  { name: 'Растяжка ног', type: ExerciseType.STRENGTH, category: 'Растяжка' },
  { name: 'Растяжка грудных мышц', type: ExerciseType.STRENGTH, category: 'Растяжка' },
  { name: 'Растяжка плечевого пояса', type: ExerciseType.STRENGTH, category: 'Растяжка' },
  // Кардио
  { name: 'Беговая дорожка', type: ExerciseType.CARDIO, category: 'Кардио' },
  { name: 'Велотренажёр', type: ExerciseType.CARDIO, category: 'Кардио' },
  { name: 'Эллипс', type: ExerciseType.CARDIO, category: 'Кардио' },
  { name: 'Гребной тренажёр', type: ExerciseType.CARDIO, category: 'Кардио' },
  { name: 'Скакалка', type: ExerciseType.CARDIO, category: 'Кардио' },
];
