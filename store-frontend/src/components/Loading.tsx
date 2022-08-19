const Loading = function () {
    // Typescript does not like conditional outside, has to render something
    // if (loading) {
    return (
        <main>
            <h3>Loading...</h3>
        </main>
    );
    // }
}

export default Loading