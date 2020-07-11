const ErrorPage: React.FC<{ error: Error | { message: string } }> = ({
  error,
}) => {
  return (
    <div className="ui-container ErrorPage">
      <h1>{error.message}</h1>
    </div>
  );
};

export default ErrorPage;
