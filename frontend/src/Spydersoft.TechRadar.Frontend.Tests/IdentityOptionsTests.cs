using Spydersoft.TechRadar.Frontend.Options;

namespace Spydersoft.TechRadar.Frontend.Tests;

public class OptionsTests
{

    [Test]
    public void IdentityOptionsDefaults()
    {
        var options = new IdentityOptions();
        using (Assert.EnterMultipleScope())
        {
            Assert.That(options.Authority, Is.Null);
            Assert.That(options.ClientId, Is.Null);
            Assert.That(options.ClientSecret, Is.Null);
            Assert.That(options.Audience, Is.Null);
            Assert.That(options.Scheme, Is.EqualTo("Duende"));
        };
    }

    [Test]
    public void IdentityOptionsScheme()
    {
        Assert.That(IdentityOptions.SectionName, Is.EqualTo("Identity"));
    }

    [Test]
    public void IdentityOptionsPropertyTest()
    {
        var options = new IdentityOptions
        {
            Authority = "https://localhost:1234",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Audience = "test-audience",
            Scheme = "test-scheme"
        };
        using (Assert.EnterMultipleScope())
        {
            Assert.That(options, Is.Not.Null);
            Assert.That(options, Has.Property("Authority").TypeOf<string>());
            Assert.That(options, Has.Property("ClientId").TypeOf<string>());
            Assert.That(options, Has.Property("ClientSecret").TypeOf<string>());
            Assert.That(options, Has.Property("Audience").TypeOf<string>());
            Assert.That(options, Has.Property("Scheme").TypeOf<string>());
        };
    }
}
