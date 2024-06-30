import { BusScheduleDefinition } from "@/config/supabase";

export const busDays = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

export const stops: Stop[] = [
    { name_zh: '北校門口', name_en: 'North Gate', code: 'A1' }, 
    { name_zh: '綜二館', name_en: 'Gen II Building', code: 'A2' }, //U: 24.794102964063065 120.99366455591867 D: 24.793869207229896 120.9936484646421
    { name_zh: '楓林小徑', name_en: 'Maple Path', code: 'A3' }, //U: 24.79178595174722 120.99228853885859 D: 24.79279891185534 120.99247358853891
    { name_zh: '人社院/生科館', name_en: 'CHSS/CLS Building', code: 'A4' }, //U: 24.78944722415075 120.98962398000295 D: 24.789700469727617 120.99004235319325
    { name_zh: '南門停車場', name_en: 'South Gate Parking Lot', code: 'A5' }, //U: 24.786856297396717 120.98848686312672 D: 24.786768633515123 120.98888914504045
    { name_zh: '奕園停車場', name_en: 'Yi Pav. Parking Lot', code: 'A6' },
    { name_zh: '台積館', name_en: 'TSMC Building', code: 'A7' },
    { name_zh: '南大校區', name_en: 'Nanda Campus', code: 'A8' },
];

export interface Stop {
    name_zh: string;
    name_en: string;
    code: string;
}

export const cityBuses: CityBus[] = [
    { id: "00200", title_zh: "2", title_en: "2", direction: ['1', '2'] },
    { id: "0020A", title_zh: "2支A", title_en: "2A", direction: ['1', '2']  },
    { id: "03100", title_zh: "31", title_en: "31", direction: ['1', '2']  },
    { id: "07430", title_zh: "藍線", title_en: "Blue", direction: ['1', '2']  },
    { id: "00100", title_zh: "藍線1區", title_en: "Blue 1", direction: ['1']  },
    { id: "00080", title_zh: "83", title_en: "83", direction: ['1', '2']  },
    { id: "01820", title_zh: "182", title_en: "182", direction: ['1', '2']  }
]

export const intercityBuses: IntercityBus[] = [
    { title_zh: "1250", title_en: "1250", id: "12500" },
    { title_zh: "1728", title_en: "1728", id: "17280" },
    { title_zh: "1804", title_en: "1804", id: "18040" },
    { title_zh: "1804A", title_en: "1804A", id: "1804A" },
    { title_zh: "1822", title_en: "1822", id: "18220" },
    { title_zh: "1865", title_en: "1865", id: "18650" },
    { title_zh: "1866", title_en: "1866", id: "18660" },
    { title_zh: "1866A", title_en: "1866A", id: "1866A" },
    { title_zh: "1866B", title_en: "1866B", id: "1866B" },
    { title_zh: "2011", title_en: "2011", id: "20110" },
    { title_zh: "5608", title_en: "5608", id: "56080" },
    { title_zh: "9003", title_en: "9003", id: "90030" },
    { title_zh: "9010", title_en: "9010", id: "90100" }
]
/*
export const supportedIntercityBuses: { from_nthu: IBus[], to_nthu: IBus[] } = {
    from_nthu: [
        { title_zh: "1250", title_en: "1250", id: "11052" },
        { title_zh: "1728", title_en: "1728", id: "15571" },
        { title_zh: "1804", title_en: "1804", id: "17351" },
        { title_zh: "1804A", title_en: "1804A", id: "11802" },
        { title_zh: "1822", title_en: "1822", id: "4611" },
        { title_zh: "1865", title_en: "1865", id: "17363" },
        { title_zh: "1866", title_en: "1866", id: "18723" },
        { title_zh: "1866A", title_en: "1866A", id: "17259" },
        { title_zh: "1866B", title_en: "1866B", id: "18726" },
        { title_zh: "2011", title_en: "2011", id: "2568" },
        { title_zh: "5608", title_en: "5608", id: "20944" },
        { title_zh: "9003", title_en: "9003", id: "13475" },
        { title_zh: "9010", title_en: "9010", id: "20529" }
    ],
    to_nthu: [
        { title_zh: "1250", title_en: "1250", id: "11053" },
        { title_zh: "1728", title_en: "1728", id: "15572" },
        { title_zh: "1804", title_en: "1804", id: "17353" },
        { title_zh: "1804A", title_en: "1804A", id: "10778" },
        { title_zh: "1822", title_en: "1822", id: "16386" },
        { title_zh: "1865", title_en: "1865", id: "17364" },
        { title_zh: "1866", title_en: "1866", id: "4622" },
        { title_zh: "1866A", title_en: "1866A", id: "17222" },
        { title_zh: "1866B", title_en: "1866B", id: "11105" },
        { title_zh: "2011", title_en: "2011", id: "16262" },
        { title_zh: "5608", title_en: "5608", id: "20945" },
        { title_zh: "9003", title_en: "9003", id: "17350" },
        { title_zh: "9010", title_en: "9010", id: "20532" }
    ]
}

export interface IBus {
    id: string,
    title_zh: string,
    title_en: string
}*/

export interface CityBus {
    id: string,
    title_zh: string,
    title_en: string,
    direction: ('1' | '2')[]
}

export interface IntercityBus {
    id: string,
    title_zh: string,
    title_en: string,
}

export const routes: Route[] = [
    { title_zh: '綠 - 台積館', title_en: 'Green - TSMC Build.', color: '#1CC34B', code: 'GU', path: ['A1U', 'A2U', 'A3U', 'A6U', 'A5U', 'A7D'] },
    { title_zh: '綠 - 台積館', title_en: 'Green - TSMC Build.', color: '#1CC34B', code: 'GUS', path: ['A2U', 'A3U', 'A6U', 'A5U', 'A7D'] },
    { title_zh: '綠 - 北校門口', title_en: 'Green - North Gate', color: '#1CC34B', code: 'GD', path: ['A7D', 'A4D', 'A3D', 'A2D', 'A1D'] },
    { title_zh: '綠 - 綜二館', title_en: 'Green - GEN II Build.', color: '#1CC34B', code: 'GDS', path: ['A7D', 'A4D', 'A3D', 'A2D'] },
    { title_zh: '紅 - 台積館', title_en: 'Red - TSMC Build.', color: '#E71212', code: 'RU', path: ['A1U', 'A2U', 'A3U', 'A4U', 'A7U'] },
    { title_zh: '紅 - 台積館', title_en: 'Red - TSMC Build.', color: '#E71212', code: 'RUS', path: ['A2U', 'A3U', 'A4U', 'A7U'] },
    { title_zh: '紅 - 北校門口', title_en: 'Red - North Gate', color: '#E71212', code: 'RD', path: ['A7U', 'A5D', 'A6D', 'A3D', 'A2D'] },
    { title_zh: '紅 - 綜二館', title_en: 'Red - GEN II Build.', color: '#E71212', code: 'RDS', path: ['A7U', 'A5D', 'A6D', 'A3D', 'A2D', 'A1D'] },
    { title_zh: '往南大校區', title_en: 'To Nanda Campus', color: '#1CC34B', code: 'NG', path: ['A1U', 'A2U', 'A4U', 'A7U', 'A8'] },
    { title_zh: '往校本部', title_en: 'To Main Campus', color: '#E71212', code: 'NB', path: ['A8', 'A7D', 'A4D', 'A2D', 'A1D'] },
]

export interface Route {
    title_zh: string;
    title_en: string;
    color: string;
    code: string;
    path: string[];
}

export type ScheduleItem = {
    arrival: Date;
    route: Route;
} & BusScheduleDefinition;


export const getVehicleDescription = (vehicle: string) => {
    const vehicleTypes = {
        '83': '83公車 $',
        'B': '遊覽車',
        'S': '小巴'
    }
    if(!Object.keys(vehicleTypes).includes(vehicle)) return vehicle;
    return vehicleTypes[vehicle as keyof typeof vehicleTypes];
}
