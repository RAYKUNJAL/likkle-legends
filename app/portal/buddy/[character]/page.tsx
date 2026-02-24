// Initialize config before the useEffect to fix the rules-of-hooks violation
const config = {...};

useEffect(() => {
    // logic that uses the config
}, [dependencies]);