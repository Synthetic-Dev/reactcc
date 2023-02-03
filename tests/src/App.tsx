import ReactCC, { useEffect, useState } from "@ccts/reactcc";

function App() {
    const [frame, setFrame] = useState(0)

    useEffect(() => {
        setFrame(frame + 1)
    })

    return <>
        <image src="rickroll.bbf" frame={math.floor(frame)} afterLastFrame={() => {
            setFrame(0)
        }} allowPalette />
    </>
}

export default App;