import ChartCard from '@/components/layout/chartcard';
import CompanyInfo from '@/components/layout/companyinforesponse';
import Sidebar from '@/components/layout/responsesidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    CategoryScale,
    ChartArea,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    ScriptableContext,
    Title,
    Tooltip,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export type YearlyData = {
    year: number;
    value: number;
};

export type SyntheticYearlyData = {
    year: number;
    value: number;
    synthetic: boolean;
};

export type CompanyData = {
    sl_no: number;
    company: string;
    country: string;
    country_code: string;
    diversity: number;
    market_cap: {
        value: number;
        synthetic: boolean;
    };
    // total_companies_in_country: number;
    // domestic_ranking: {
    //     diversity_ranking: number;
    //     stock: number;
    //     expense: number;
    //     revenue: number;
    //     market_share: number;
    // };
    // global_ranking: {
    //     stock: number;
    //     expense: number;
    //     revenue: number;
    //     market_share: number;
    // };
    stock_price: SyntheticYearlyData[];
    expense: YearlyData[];
    revenue: YearlyData[];
    market_share: YearlyData[];
};

interface GeminiAnalysis {
    analysis?: {
        growth?: {
            revenue?: string;
            expense?: string;
            market_share?: string;
            overall?: string;
        };
        stability?: {
            revenue?: string;
            expense?: string;
            market_share?: string;
            overall?: string;
        };
        key_insights?: {
            revenue_and_expense?: string;
            market_share_fluctuations?: string;
            diversity_score?: string;
        };
    };
    predictions?: {
        stock_price?: {
            domestic?: string;
            global?: string;
        };
        market_share?: {
            domestic?: string;
            global?: string;
        };
        revenue?: {
            domestic?: string;
            global?: string;
        };
        expense: {
            domestic?: string;
            global?: string;
        };
        overall?: string;
    };
    explanation_of_predictions?: {
        stock_price?: string;
        market_share?: string;
        revenue?: string;
        expense?: string;
    };
}

export default function ResponsePage() {
    const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysis | null>(
        null
    );
    const location = useLocation();
    const navigate = useNavigate();
    const barRef = useRef(null);
    const theme = localStorage.getItem('theme') || 'light';
    const [darkMode, setdarkMode] = useState(theme === 'dark');
    // const [geminiAnalysis, setGeminiAnalysis] = useState<object>({});

    useEffect(() => {
        const fetchGeminiAnalysis = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const id = params.get('id');

                const response = await fetch(
                    `http://localhost:5000/companies/gemini-analyze/${id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch Gemini analysis');
                }
                const data = await response.json();
                const analysisText =
                    data.result?.response?.candidates?.[0]?.content?.parts?.[0]
                        ?.text || 'No analysis available.';
                setGeminiAnalysis(JSON.parse(analysisText));
            } catch (error) {
                console.error('Error fetching Gemini analysis:', error);
                setGeminiAnalysis({
                    analysis: {
                        growth: {
                            revenue: 'Failed to load Gemini analysis.',
                            expense: 'Failed to load Gemini analysis.',
                            market_share: 'Failed to load Gemini analysis.',
                            overall: 'Failed to load Gemini analysis.',
                        },
                        stability: {
                            revenue: 'Failed to load Gemini analysis.',
                            expense: 'Failed to load Gemini analysis.',
                            market_share: 'Failed to load Gemini analysis.',
                            overall: 'Failed to load Gemini analysis.',
                        },
                        key_insights: {
                            revenue_and_expense:
                                'Failed to load Gemini analysis.',
                            market_share_fluctuations:
                                'Failed to load Gemini analysis.',
                            diversity_score: 'Failed to load Gemini analysis.',
                        },
                    },
                });
            }
        };

        fetchGeminiAnalysis();
    }, [location.search]);

    const [companyData, setCompanyData] = useState<CompanyData>({
        sl_no: 1,
        company: 'Zooxo',
        country: 'Ukraine',
        country_code: 'UAH',
        diversity: 43.5,
        market_cap: {
            // Fixed to match `CompanyData` type
            value: 2340000000.0,
            synthetic: false,
        },
        // total_companies_in_country: 25,
        // domestic_ranking: {
        //     diversity_ranking: 1,
        //     stock: 1,
        //     expense: 1,
        //     revenue: 1,
        //     market_share: 1,
        // },
        // global_ranking: {
        //     stock: 1,
        //     expense: 1,
        //     revenue: 1,
        //     market_share: 1,
        // },
        stock_price: [
            // Fixed to match `CompanyData` type
            { year: 2015, value: 636190000, synthetic: false },
            { year: 2016, value: 36170000000, synthetic: false },
            { year: 2017, value: 18615000000, synthetic: false },
            { year: 2018, value: 1060000000, synthetic: false },
            { year: 2019, value: 308220000, synthetic: false },
            { year: 2020, value: 514130000, synthetic: false },
            { year: 2021, value: 21660000, synthetic: false },
            { year: 2022, value: 555700000, synthetic: false },
            { year: 2023, value: 355280000, synthetic: false },
        ],
        expense: [
            { year: 2015, value: 20101562.63 },
            { year: 2016, value: 51007842.36 },
            { year: 2017, value: 62056576.98 },
            { year: 2018, value: 79478124.95 },
            { year: 2019, value: 52885481.03 },
            { year: 2020, value: 71228506.48 },
            { year: 2021, value: 17224689.73 },
            { year: 2022, value: 96688655.13 },
            { year: 2023, value: 67582493.42 },
        ],
        revenue: [
            { year: 2015, value: 11889859.91 },
            { year: 2016, value: 12926239.97 },
            { year: 2017, value: 26106119.1 },
            { year: 2018, value: 86658338.25 },
            { year: 2019, value: 21961920.16 },
            { year: 2020, value: 93825082.89 },
            { year: 2021, value: 50393952.13 },
            { year: 2022, value: 78632245.86 },
            { year: 2023, value: 95627554.77 },
        ],
        market_share: [
            { year: 2015, value: 28.24 },
            { year: 2016, value: 42.01 },
            { year: 2017, value: 73.14 },
            { year: 2018, value: 90.64 },
            { year: 2019, value: 56.8 },
            { year: 2020, value: 48.79 },
            { year: 2021, value: 35.4 },
            { year: 2022, value: 65.88 },
            { year: 2023, value: 38.85 },
        ],
    });

    useEffect(() => {
        const fetchRawData = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const id = params.get('id');

                if (!id) {
                    navigate('/computation');
                }
                const response = await fetch(
                    `http://localhost:5000/companies/raw-data/${id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch company data');
                }
                const fetchedData: CompanyData = await response.json(); // Assuming API returns correct data structure
                setCompanyData(fetchedData);
            } catch (error) {
                console.error('Error fetching company data:', error);
            }
        };

        fetchRawData();
    }, [location.search, navigate]);

    const years = companyData.stock_price.map((item) => item.year); // Fixed property name

    useEffect(() => {
        setdarkMode(theme === 'dark');
    }, [darkMode, theme]);

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                ticks: { color: '#828282' },
                grid: {
                    display: false,
                },
            },
            y: {
                ticks: { color: '#828282' },
                grid: {
                    display: false,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
                position: 'top' as const,
                labels: {
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: true,
            },
        },
    };

    const stockChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                ticks: { color: '#828282' },
                grid: {
                    display: false,
                },
            },
            y: {
                border: { dash: [2, 2] },
                ticks: { color: '#828282' },
                grid: {
                    display: true,
                    color: darkMode ? '#2D2D2D' : '#E5E7EB',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
                position: 'top' as const,
                labels: {
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false,
            },
        },
    };

    const spendActivityOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                ticks: { color: '#828282' },
                grid: {
                    display: false,
                },
            },
            y: {
                border: { dash: [2, 2] },
                ticks: { color: '#828282' },
                grid: {
                    display: true,
                    color: darkMode ? '#2D2D2D' : '#E5E7EB',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
                position: 'top' as const,
                labels: {
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false,
            },
        },
    };

    const stockPriceData = {
        labels: years,
        datasets: [
            {
                label: 'Stock Price',
                data: companyData.stock_price.map((item) => item.value), // Fixed property name
                borderColor: (() => {
                    if (
                        companyData.stock_price[
                            companyData.stock_price.length - 1
                        ].value > companyData.stock_price[0].value
                    ) {
                        return darkMode ? '#00D693' : '#10B981';
                    } else {
                        return darkMode ? '#993030' : '#EF4444';
                    }
                })(),
                backgroundColor: (() => {
                    if (
                        companyData.stock_price[
                            companyData.stock_price.length - 1
                        ].value > companyData.stock_price[0].value
                    ) {
                        return darkMode
                            ? 'rgba(0, 214, 147, 0.1)'
                            : 'rgba(16, 185, 129, 0.1)';
                    } else {
                        return darkMode
                            ? 'rgba(153, 48, 48, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)';
                    }
                })(),
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const spendActivityData = {
        labels: years,
        datasets: [
            {
                label: 'Expense',
                data: companyData.expense.map((item) => item.value),
                borderColor: 'rgba(244, 98, 94, 1)',
                backgroundColor: 'rgba(244, 98, 94, 0.2)',

                fill: false,
                borderWidth: 1,
            },
            {
                label: 'Revenue',
                data: companyData.revenue.map((item) => item.value),
                borderColor: 'rgba(0, 210, 190, 1)',
                backgroundColor: '#009164',
                fill: false,
                borderWidth: 1,
            },
        ],
    };

    const marketShareData = {
        labels: years,
        datasets: [
            {
                label: 'Market Share',
                data: companyData.market_share.map((item) => item.value),
                backgroundColor: function (context: ScriptableContext<'bar'>) {
                    const chart = context.chart;
                    const {
                        ctx,
                        chartArea,
                    }: { ctx: CanvasRenderingContext2D; chartArea: ChartArea } =
                        chart;

                    if (!chartArea) {
                        return darkMode ? '#2D2D2F' : '#FF3300';
                    }

                    const gradient = ctx.createLinearGradient(
                        chartArea.left,
                        chartArea.bottom,
                        chartArea.left,
                        chartArea.top
                    );

                    if (darkMode) {
                        gradient.addColorStop(0, '#1F1F20');
                        gradient.addColorStop(0.5, '#2D2D2F');
                        gradient.addColorStop(1, '#2D2D2F');

                        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                        ctx.shadowBlur = 10;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 4;
                    } else {
                        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        gradient.addColorStop(1, '#FF3300');
                        gradient.addColorStop(0, '#FF653F');
                    }

                    ctx.fillStyle = gradient;

                    return gradient;
                },
                hoverBackgroundColor: function (
                    context: ScriptableContext<'bar'>
                ) {
                    const chart = context.chart;
                    const {
                        ctx,
                        chartArea,
                    }: { ctx: CanvasRenderingContext2D; chartArea: ChartArea } =
                        chart;

                    if (!chartArea) {
                        return darkMode ? '#F24A21' : '#4B4B4B';
                    }

                    const hoverGradient = ctx.createLinearGradient(
                        chartArea.left,
                        chartArea.bottom,
                        chartArea.left,
                        chartArea.top
                    );

                    if (darkMode) {
                        hoverGradient.addColorStop(0, '#BD6955');
                        hoverGradient.addColorStop(1, '#F24A21');
                    } else {
                        hoverGradient.addColorStop(1, '#2D2D2D');
                        hoverGradient.addColorStop(0, '#4B4B4B');
                    }

                    return hoverGradient;
                },
                borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                },
                borderSkipped: false,
            },
        ],
    };

    return (
        <div className={`flex min-h-full bg-background`}>
            <Sidebar />
            <div className="flex-1 p-2">
                <div className="flex">
                    <div className="w-5/6">
                        <CompanyInfo data={companyData} />
                    </div>
                    <div className="flex w-1/6 items-center justify-center">
                        <Button
                            onClick={() => navigate('/chat')}
                            className="h-12 w-36 rounded-lg bg-button_secondary text-xl shadow-box_shadow hover:bg-slate-50 dark:hover:bg-[#303030]"
                        >
                            <span className="gemini-gradient"> Ask Gemini</span>
                        </Button>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <div
                            className={`rounded-xl bg-white p-4 shadow-box_shadow dark:bg-gradient-to-b dark:from-[#222120] dark:via-[#1A1919] dark:to-[#171717]`}
                        >
                            <h3 className="m-1 mb-2 text-center text-xl font-semibold text-primary">
                                Market Share
                            </h3>
                            <Bar
                                ref={barRef}
                                data={marketShareData}
                                options={barChartOptions}
                                height={100}
                            />
                        </div>
                    </div>
                    <div>
                        <ChartCard
                            title="Stock Price"
                            data={stockPriceData}
                            options={stockChartOptions}
                            height={100}
                        />
                    </div>
                    <div className="col-span-2 h-1/3 w-full">
                        <ChartCard
                            title="Spend Activity"
                            data={spendActivityData}
                            options={spendActivityOptions}
                            height={60}
                        />
                    </div>
                    <div className="col-span-2">
                        <Card className="h-full bg-background">
                            <CardHeader>
                                <h3 className="m-1 text-center text-xl font-semibold text-primary">
                                    Gemini Analysis
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="shadow-lg max-h-96 overflow-y-auto rounded-lg bg-background p-6">
                                    {geminiAnalysis ? (
                                        <>
                                            {/* Analysis Section */}
                                            <h1 className="m-1 mb-4 text-2xl font-bold text-primary">
                                                {companyData.company} Analysis
                                            </h1>

                                            {/* Growth Analysis */}
                                            <h5 className="mt-4 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                Growth
                                            </h5>
                                            <div className="mt-2">
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Revenue:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis?.analysis
                                                            ?.growth?.revenue
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Expense:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis.analysis
                                                            ?.growth?.expense
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Market Share:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis?.analysis
                                                            ?.growth
                                                            ?.market_share
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Overall:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis.analysis
                                                            ?.growth?.overall
                                                    }
                                                </p>
                                            </div>

                                            {/* Stability Analysis */}
                                            <h5 className="mt-6 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                Stability
                                            </h5>
                                            <div className="mt-2">
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Revenue:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis.analysis
                                                            ?.stability?.revenue
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Expense:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis.analysis
                                                            ?.stability?.expense
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Market Share:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis.analysis
                                                            ?.stability
                                                            ?.market_share
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Overall:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis?.analysis
                                                            ?.stability?.overall
                                                    }
                                                </p>
                                            </div>

                                            {/* Key Insights */}
                                            <h5 className="mt-6 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                Key Insights
                                            </h5>
                                            <div className="mt-2">
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Revenue and Expense:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis?.analysis
                                                            ?.key_insights
                                                            ?.revenue_and_expense
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Market Share
                                                        Fluctuations:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis?.analysis
                                                            ?.key_insights
                                                            ?.market_share_fluctuations
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Diversity Score:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis?.analysis
                                                            ?.key_insights
                                                            ?.diversity_score
                                                    }
                                                </p>
                                            </div>

                                            {/* Predictions Section */}
                                            <h4 className="mt-8 text-3xl font-bold text-primary">
                                                Predictions
                                            </h4>

                                            {/* Stock Price Predictions */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h5 className="mt-4 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                        Stock Price
                                                    </h5>
                                                    <div className="mt-2">
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Domestic:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.stock_price
                                                                    ?.domestic
                                                            }
                                                        </p>
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Global:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.stock_price
                                                                    ?.global
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="mt-4 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                        Market Share
                                                    </h5>
                                                    <div className="mt-2">
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Domestic:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.market_share
                                                                    ?.domestic
                                                            }
                                                        </p>
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Global:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.market_share
                                                                    ?.global
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="mt-4 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                        Revenue
                                                    </h5>
                                                    <div className="mt-2">
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Domestic:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.revenue
                                                                    ?.domestic
                                                            }
                                                        </p>
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Global:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.revenue
                                                                    ?.global
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="mt-4 text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                        Expense
                                                    </h5>
                                                    <div className="mt-2">
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Domestic:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.expense
                                                                    ?.domestic
                                                            }
                                                        </p>
                                                        <p className="m-1 text-primary">
                                                            <strong className="font-bold">
                                                                Global:
                                                            </strong>{' '}
                                                            {
                                                                geminiAnalysis
                                                                    ?.predictions
                                                                    ?.expense
                                                                    ?.global
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="m-1 text-primary">
                                                <strong className="font-bold">
                                                    Overall:
                                                </strong>{' '}
                                                {
                                                    geminiAnalysis?.predictions
                                                        ?.overall
                                                }
                                            </p>

                                            {/* Explanation of Predictions */}
                                            <h4 className="mt-8 text-xl font-bold text-orange-500 dark:text-orange-400">
                                                Explanation of Predictions
                                            </h4>
                                            <div className="mt-2">
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Stock Price:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis
                                                            ?.explanation_of_predictions
                                                            ?.stock_price
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Market Share:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis
                                                            ?.explanation_of_predictions
                                                            ?.market_share
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Revenue:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis
                                                            ?.explanation_of_predictions
                                                            ?.revenue
                                                    }
                                                </p>
                                                <p className="m-1 text-primary">
                                                    <strong className="font-bold">
                                                        Expense:
                                                    </strong>{' '}
                                                    {
                                                        geminiAnalysis
                                                            ?.explanation_of_predictions
                                                            ?.expense
                                                    }
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-center text-gray-500">
                                            Loading Gemini analysis...
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
