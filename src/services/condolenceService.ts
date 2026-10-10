import { CondolenceMessage } from '../types';
import { HONORED_PERSONS } from '../data/persons';
import { sanitizeBoundedText } from '../utils/security';

const STORAGE_KEY = 'sadaqah_condolence_messages_v5';

const INITIAL_MESSAGES: CondolenceMessage[] = [
  {
    id: 'msg-1',
    author: 'محمد أيمن',
    message: 'اللهم اغفر لعمامي الغاليين الأربعة وأكرم نُزُلهم: عمي رمضان، وعمي الشهاوي، وعمي الشافعي، وعمي أحمد الشهاوي عبدالمجيد. اللهم وسّع مدخلهم، واغسلهم بالماء والثلج والبرد، ونقّهم من الذنوب والخطايا كما يُنقّى الثوب الأبيض من الدنس.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'msg-2',
    author: 'محمد أيمن',
    message: 'اللهم اجعل قبور عمامي الأربعة روضةً من رياض الجنة ولا تجعلها حفرة من حفر النار، اللهم افسح لهم في قبورهم مدّ بصرهم، وافرش قبورهم من فراش الجنة، واملأها نوراً وضياءً وبشرى وأماناً وسروراً إلى يوم يلقونك وأنت راضٍ عنهم.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'msg-3',
    author: 'محمد أيمن',
    message: 'اللهم اجمع عمامي الأربعة معاً في الفردوس الأعلى من الجنة على سرر متقابلين، في ظلال ممدودة، وماء مسكوب، وفاكهة كثيرة لا مقطوعة ولا ممنوعة، في جوار الحبيب المصطفى ﷺ مع النبيين والصديقين والشهداء والصالحين وحسن أولئك رفيقا.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: 'msg-4',
    author: 'محمد أيمن',
    message: 'اللهم إن عمامي الأربعة كانوا في دنيانا سنداً وأصحاب قلوب طاهرة نقية وأيادٍ بيضاء وذكرٍ طيب، فجازهم يا ربنا بالإحسان إحساناً، وعن السيئات عفواً وغفراناً ورضواناً ومغفرةً واسعة ملء السماوات والأرض.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'msg-5',
    author: 'محمد أيمن',
    message: 'اللهم أنزل على قبور عمامي الأربعة نسائم رحمتك وبرد عفوك وطيب مسكك، واجعل عن يمين كل واحد منهم نوراً، وعن شماله نوراً، ومن فوقه نوراً، ومن تحته نوراً، وبشرهم بروح وريحان وربٍ راضٍ غير غضبان.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: 'msg-6',
    author: 'محمد أيمن',
    message: 'اللهم اسقِ عمامي الأربعة من حوض نبيك المصطفى ﷺ شربةً هنيئةً مريئةً لا يظمأون بعدها أبداً، وثبّت أقدامهم على الصراط، ويمّن كتابهم، ويسّر حسابهم، وثقّل موازينهم بالحسنات، وتجاوز عن كل زلة وسيأة.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'msg-7',
    author: 'محمد أيمن',
    message: 'اللهم أظلّ عمامي الأربعة في ظلك يوم لا ظل إلا ظلك، ولقّهم نضرةً وسروراً، وجازهم بما صبروا جنةً وحريراً، متكئين فيها على الأرائك لا يرون فيها شمساً ولا زمهريراً، ودانيةً عليهم ظلالها وذُللت قطوفها تذليلاً.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 32,
  },
  {
    id: 'msg-8',
    author: 'محمد أيمن',
    message: 'اللهم اجعل كل حرفٍ يُتلى، وكل آية قرآنية تُقرأ، وكل تسبيحة واستغفار في هذه المنصة صدقةً جارية ونوراً ساطعاً وبشائر هانئة يصل ثوابها كاملاً مكللاً بالبركة لعمامي الأربعة رحمهم الله رحمةً واسعة تملأ الآفاق.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 42,
  },
  {
    id: 'msg-9',
    author: 'محمد أيمن',
    message: 'يا رب يا كريم يا واسع العطاء، إن عمامي الأربعة نزلوا بك وأنت خير منزول به، وأصبحوا فقراء إلى رحمتك وأنت غني عن عذابهم، فارحم غربتهم وآنس وحشتهم وأَمّن روعتهم وافتح لهم أبواباً تهب منها نسائم الفردوس إلى يوم يبعثون.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 56,
  },
  {
    id: 'msg-10',
    author: 'محمد أيمن',
    message: 'اللهم ارحم عمامي الأربعة رحمةً تطمئن بها نفوسهم، وتقرّ بها أعينهم، وتسكن بها أرواحهم الطاهرة في أعلى عليين، واجعلهم في جوارك آمنين مطمئنين فرحين مستبشرين بما آتاهم الله من فضله وكرمه يا أرحم الراحمين.',
    targetPersonId: 'all',
    targetPersonName: 'عمامي الأربعة رحمهم الله جميعاً',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
  },
];

export function getCondolenceMessages(): CondolenceMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: CondolenceMessage[] = JSON.parse(raw);
      // Ensure all messages are collective and valid
      const hasOldIndividual = parsed.some(
        (m) =>
          m.targetPersonId !== 'all' ||
          m.author !== 'محمد أيمن'
      );
      if (!hasOldIndividual && parsed.length >= 10) {
        return parsed;
      }
    }
  } catch (e) {}

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
  } catch (e) {}

  return INITIAL_MESSAGES;
}

export function addCondolenceMessage(
  author: string,
  message: string,
  targetPersonId: string = 'all'
): CondolenceMessage {
  const targetPerson = HONORED_PERSONS.find((p) => p.id === targetPersonId);
  const targetPersonName =
    targetPersonId === 'all'
      ? 'عمامي الأربعة رحمهم الله جميعاً'
      : targetPerson
      ? `عمي ${targetPerson.name}`
      : 'الفقداء الكرام';

  const newMsg: CondolenceMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    author: sanitizeBoundedText(author, 60) || 'محب وداعٍ بالخير',
    message: sanitizeBoundedText(message, 1200),
    targetPersonId,
    targetPersonName,
    createdAt: Date.now(),
  };

  try {
    const current = getCondolenceMessages();
    const updated = [newMsg, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  return newMsg;
}
