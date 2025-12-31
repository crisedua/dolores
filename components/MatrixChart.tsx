'use client';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';

interface Problem {
    id: string;
    description: string;
    frequency: number;       // x
    economicIntent: number;  // y
    trend: 'GROWING' | 'STABLE' | 'DECLINING';
    competition: 'HIGH' | 'MED' | 'LOW';
}

export function MatrixChart({ data }: { data: Problem[] }) {

    return (
        <div className="w-full bg-[#121212] rounded-xl border border-[#222] p-6 relative">
            <h3 className="text-gray-400 text-sm font-medium mb-6">Signal vs. Noise Matrix</h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
                    >
                        {/* Dark Grid with Dashed Lines */}
                        <CartesianGrid stroke="#222" strokeDasharray="5 5" vertical={true} horizontal={true} />

                        {/* Axes */}
                        <XAxis
                            type="number"
                            dataKey="frequency"
                            domain={[0, 100]}
                            stroke="#444"
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={{ stroke: '#333' }}
                        >
                            <Label value="Discussion Frequency" offset={-20} position="insideBottom" fill="#555" fontSize={14} />
                        </XAxis>
                        <YAxis
                            type="number"
                            dataKey="economicIntent"
                            domain={[0, 100]}
                            stroke="#444"
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={{ stroke: '#333' }}
                        >
                            <Label value="Willingness to Pay" angle={-90} position="insideLeft" fill="#555" fontSize={14} style={{ textAnchor: 'middle' }} />
                        </YAxis>

                        {/* Quadrant Dividers */}
                        <ReferenceLine x={50} stroke="#333" strokeDasharray="8 8" />
                        <ReferenceLine y={50} stroke="#333" strokeDasharray="8 8" />

                        {/* Quadrant Labels */}
                        <ReferenceLine
                            x={52} y={92}
                            label={{ value: 'Gold Mine', fill: '#4ADE80', fontSize: 10, position: 'insideTopRight' }}
                            stroke="transparent"
                        />
                        <ReferenceLine
                            x={48} y={92}
                            label={{ value: 'Niche', fill: '#3B82F6', fontSize: 10, position: 'insideTopLeft' }}
                            stroke="transparent"
                        />

                        {/* Tooltip */}
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-[#1A1A1A] border border-[#333] p-3 rounded-lg shadow-xl max-w-xs z-50">
                                            <p className="font-medium text-white mb-1 text-sm">{data.description}</p>
                                            <div className="flex gap-3 text-xs text-gray-500 mt-2">
                                                <span>Freq: {data.frequency}</span>
                                                <span>Pay: {data.economicIntent}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* Data Points */}
                        <Scatter name="Problems" data={data}>
                            {data.map((entry, index) => {
                                // Color logic based on quadrants or metrics
                                // Top Right (High Freq, High Pay) -> Green
                                // Top Left (Low Freq, High Pay) -> Blue/Teal
                                let fillColor = "#6B7280"; // Noise
                                if (entry.economicIntent > 50) {
                                    fillColor = entry.frequency > 50 ? "#4ADE80" : "#2DD4BF";
                                }

                                return <Cell key={`cell-${index}`} fill={fillColor} r={6} strokeWidth={0} />;
                            })}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
